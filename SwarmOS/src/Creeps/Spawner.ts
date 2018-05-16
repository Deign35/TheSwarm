declare var Memory: {
    spawnData: SpawnRegistryExtension_Memory,
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<SpawnRegistryExtension_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SpawnManager, Spawner);

        let SpawnerExtension = new SpawnExtension(extensionRegistry);
        extensionRegistry.register(EXT_CreepSpawner, SpawnerExtension);
        extensionRegistry.register(EXT_CreepRegistry, SpawnerExtension);
    }
}

const PKG_Spawner_LogContext: LogContext = {
    logID: PKG_SpawnManager,
    logLevel: LOG_DEBUG
}

// This order determines the default order of body parts
const BodyLegend = {
    t: TOUGH,
    a: ATTACK,
    r: RANGED_ATTACK,
    cl: CLAIM,
    w: WORK,
    c: CARRY,
    h: HEAL,
    m: MOVE,
}
const ConvertContextToSpawnBody = function (context: CreepContext) {
    let body = [];
    let bodyDef = CreepBodies.get(context.b)[context.l];
    for (let bodyID in BodyLegend) {
        if (bodyDef[bodyID]) {
            for (let i = 0; i < bodyDef[bodyID]; i++) {
                body.push(BodyLegend[bodyID]);
            }
        }
    }

    return body;
}

class Spawner extends BasicProcess<{}> {
    @extensionInterface(EXT_CreepSpawner)
    SpawnerExtensions!: SpawnExtension;

    protected get spawnerMemory(): SpawnRegistryExtension_Memory {
        if (!Memory.spawnData) {
            this.log.warn(`Initializing Spawner spawnerMemory`);
            Memory.spawnData = {
                queue: {}
            }
        }
        return Memory.spawnData;
    }
    protected get spawnQueue(): SDictionary<SpawnerRequest> {
        return this.spawnerMemory.queue;
    }

    protected get logID(): string {
        return PKG_Spawner_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_Spawner_LogContext.logLevel!;
    }

    executeProcess(): void {
        this.log.debug(`Begin Spawner`);
        let unassignedCreeps: SDictionary<Creep> = {};
        this.spawnCreeps(unassignedCreeps);
        this.sleeper.sleep(3);

        this.log.debug(`End Spawner`);
    }

    protected spawnCreeps(unassignedCreeps: SDictionary<Creep>): void {
        let requests = Object.keys(this.spawnQueue);
        if (requests.length == 0) {
            this.log.warn(`No spawn requests in the queue.  You have spawn capacity available.`);
            return;
        }

        let minSpawnCost = 36000;
        for (let i = 0; i < requests.length; i++) {
            let req = this.spawnQueue[requests[i]];
            if (req.sta != SP_QUEUED) {
                if (req.sta == SP_SPAWNING && !Game.creeps[req.con.n]) {
                    req.sta = SP_ERROR;
                }
                continue;
            }

            minSpawnCost = Math.min(minSpawnCost, CreepBodies.get(req.con.b)[req.con.l].cost);
        }

        let availableSpawns: SDictionary<StructureSpawn> = {};
        let spawnIDs = Object.keys(Game.spawns);

        for (let i = 0, length = spawnIDs.length; i < length; i++) {
            let spawn = Game.spawns[spawnIDs[i]];
            if (spawn.isActive() && !spawn.spawning && spawn.room.energyAvailable >= minSpawnCost) {
                availableSpawns[spawnIDs[i]] = spawn;
            }
        }

        spawnIDs = Object.keys(availableSpawns).sort((a, b) => {
            return availableSpawns[a].room.energyAvailable > availableSpawns[b].room.energyAvailable ? -1 : 1;
        });

        this.log.debug(`AvailableSpawnerCount(${spawnIDs.length}) - SpawnRequestCount(${requests.length})`);
        for (let i = 0; i < spawnIDs.length; i++) {
            let spawnRequest: { req?: SpawnerRequest, diff: number } = { req: undefined, diff: 0 };
            let spawn = availableSpawns[spawnIDs[i]];

            for (let j = 0; j < requests.length; j++) {
                let req = this.spawnQueue[requests[j]];
                if (req.sta != SP_QUEUED) {
                    continue;
                }
                let diff = CreepBodies.get(req.con.b)[req.con.l].cost;
                let dist = Game.map.getRoomLinearDistance(spawn.room.name, req.loc) || 0
                if (req.max && dist > req.max) {
                    continue;
                }
                diff += E2C_MaxSpawnDistance * (req.max || 0);
                diff -= E2C_SpawnDistance * dist;
                if (spawnRequest.req && req.pri != spawnRequest.req.pri) {
                    if (req.pri > spawnRequest.req.pri) {
                        spawnRequest = { req, diff }
                    }
                    continue;
                }

                if (!spawnRequest.req || diff > spawnRequest.diff) {
                    spawnRequest = { req, diff }
                }
            }

            if (spawnRequest.req && spawnRequest.diff > 0) {
                // Spawn it
                let spawnResult = ERR_INVALID_ARGS as ScreepsReturnCode;
                while (spawnResult != OK && spawnRequest.req.sta == SP_QUEUED) {
                    // construct the body here somehow
                    spawnResult = spawn.spawnCreep(ConvertContextToSpawnBody(spawnRequest.req.con),
                        spawnRequest.req.con.n,
                        { memory: spawnRequest.req.dm });
                    switch (spawnResult) {
                        case (ERR_NAME_EXISTS):
                            spawnRequest.req.con.n += `_` + (Game.time % GetRandomIndex(primes_100));
                        case (OK):
                            break;
                        default:
                            this.log.error(`Spawn Creep has failed (${spawnResult})`);
                            spawnRequest.req.sta = SP_ERROR;
                            break;
                    }
                }

                if (spawnResult == OK) {
                    this.log.debug(`Spawn Creep successful for ${spawnRequest.req.con.n} - pid(${spawnRequest.req.pid})`);
                    spawnRequest.req.sta = SP_SPAWNING;
                }
            }
        }
    }
}

class SpawnExtension extends ExtensionBase implements ISpawnRegistryExtensions {
    protected get memory(): SpawnRegistryExtension_Memory {
        if (!Memory.spawnData) {
            this.log.warn(`Initializing Spawner memory`);
            Memory.spawnData = {
                queue: {},
                spawnedCreeps: {}
            }
        }
        return Memory.spawnData;
    }
    protected get spawnQueue(): SDictionary<SpawnerRequest> {
        return this.memory.queue;
    }

    getRequestStatus(id: SpawnRequestID): SpawnState {
        if (!this.spawnQueue[id]) {
            return SP_ERROR;
        }
        let spawnRequest = this.spawnQueue[id];

        if (spawnRequest.sta == SP_SPAWNING) {
            let creep = Game.creeps[spawnRequest.con.n];
            if (creep && !creep.spawning) {
                this.spawnQueue[id].sta = SP_COMPLETE;
                spawnRequest.sta = SP_COMPLETE;
            }
        }

        return spawnRequest.sta;
    }
    /*
        Spawn requests need to be split from creep references.
        Spawn requests should be renewable absent an existing creep.
    */
    resetRequest(id: SpawnRequestID, priority?: Priority, newContext?: CreepContext, defaultMemory?: any) {
        if (this.spawnQueue[id]) {
            this.spawnQueue[id].sta = SP_QUEUED;
        }
        if (priority) {
            this.spawnQueue[id].pri = priority;
        }
        if (newContext) {
            this.spawnQueue[id].con = newContext;
        }
        if (defaultMemory) {
            this.spawnQueue[id].dm = defaultMemory;
        }
    }
    cancelRequest(id: SpawnRequestID): boolean {
        if (this.spawnQueue[id]) {
            delete this.spawnQueue[id];
            return true;
        }

        return false;
    }

    giveRequestToPID(id: SpawnRequestID, pid: PID) {
        // (TODO): Check that context.o doesn't get overwritten by the spawner when the creep is spawned
        this.spawnQueue[id].con.o = pid;
    }
    requestSpawn(context: CreepContext, location: RoomID, requestorPID: PID, spawnPriority: Priority,
        maxSpawnDistance: number = 3, startMem?: any): SpawnRequestID {
        let newRequest: SpawnerRequest = {
            con: context,
            dm: startMem,
            id: GetSUID(),
            loc: location,
            max: maxSpawnDistance,
            pid: requestorPID,
            pri: spawnPriority,
            sta: SP_QUEUED,
        }

        this.spawnQueue[newRequest.id] = newRequest;
        return newRequest.id;
    }
}