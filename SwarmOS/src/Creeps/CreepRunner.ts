declare var Memory: {
    spawnData: SpawnerExtension_Memory,
}

import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<SpawnerExtension_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepRunner, CreepRunner);

        let CreepRunnerExtension = new SpawnExtension(extensionRegistry);
        extensionRegistry.register(EXT_CreepSpawner, CreepRunnerExtension);
        extensionRegistry.register(EXT_CreepRegistry, CreepRunnerExtension);
    }
}

const PKG_CreepRunner_LogContext: LogContext = {
    logID: PKG_CreepRunner,
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

const ConvertContextToSpawnCost = function (context: CreepContext) {
    let cost = 0;
    for (let bodyID in BodyLegend) {
        if (context[bodyID]) {
            cost += BODYPART_COST[BodyLegend[bodyID]] * context[bodyID];
        }
    }

    return cost;
}
const ConvertContextToHash = function (context: CreepContext) {
    let hashID = '';
    for (let bodyID in BodyLegend) {
        if (context[bodyID]) {
            hashID += context[bodyID] + bodyID;
        }
    }

    return hashID;
}
const ConvertContextToSpawnBody = function (context: CreepContext) {
    let body = [];
    for (let bodyID in BodyLegend) {
        if (context[bodyID]) {
            for (let i = 0; i < context[bodyID]; i++) {
                body.push(BodyLegend[bodyID]);
            }
        }
    }

    return body;
}
const CompareContextCompatibility = function (left: CreepContext, right: CreepContext) {
    let score = 0;

    for (let bodyID in BodyLegend) {
        if (!left[bodyID] || !right[bodyID]) {
            if (left[bodyID] || right[bodyID]) {
                return 0;
            }
        }

        if (left[bodyID] && right[bodyID]) {
            score = BODYPART_COST[BodyLegend[bodyID]] * Math.min(left[bodyID], right[bodyID]);
        }

    }
    return score;
}

class CreepRunner extends BasicProcess<{}> {
    @extensionInterface(EXT_CreepSpawner)
    SpawnerExtensions!: SpawnExtension;

    protected get spawnerMemory(): SpawnerExtension_Memory {
        if (!Memory.spawnData) {
            this.log.warn(`Initializing CreepRunner spawnerMemory`);
            Memory.spawnData = {
                queue: {},
                spawnedCreeps: {}
            }
        }
        return Memory.spawnData;
    }
    protected get spawnQueue(): SDictionary<SpawnerRequest> {
        return this.spawnerMemory.queue;
    }
    protected get spawnedCreeps(): SDictionary<CreepContext> {
        return this.spawnerMemory.spawnedCreeps;
    }
    protected get spawnCosts(): SDictionary<number> {
        return this.cache.costs;
    }
    protected initProcessCacheData() {
        return {
            costs: {}
        }
    }

    protected get logID(): string {
        return PKG_CreepRunner_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_CreepRunner_LogContext.logLevel!;
    }

    executeProcess(): void {
        this.log.debug(`Begin CreepRunner`);
        let unassignedCreeps: SDictionary<Creep> = {};

        // (TODO) Revert all managers from using global memory.  Just do it right(?)
        // This confines the CreepRunner to only manage creeps that
        // have been spawned by it.
        let spawnedIDs = Object.keys(this.spawnedCreeps);
        for (let i = 0; i < spawnedIDs.length; i++) {
            let creepContext = this.spawnedCreeps[spawnedIDs[i]];
            let creepName = creepContext.n;
            let creep = Game.creeps[creepName];
            if (!creep) {
                delete this.spawnedCreeps[creepName];
            } else {
                // (TODO): Find a way to clear dead spawn requests
                if (!this.spawnedCreeps[spawnedIDs[i]].o || !this.kernel.getProcessById(this.spawnedCreeps[spawnedIDs[i]].o!)) {
                    unassignedCreeps[creepName] = creep
                }
            }
        }
        this.spawnCreeps(unassignedCreeps);
        this.sleeper.sleep(3);

        this.log.debug(`End CreepRunner`);
    }

    protected spawnCreeps(unassignedCreeps: SDictionary<Creep>): void {
        let requests = Object.keys(this.spawnQueue);
        if (requests.length == 0) {
            this.log.warn(`No spawn requests in the queue.  You have spawn capacity available.`);
            return;
        }
        let idToHashMap = {}; // This needs to not be saved because the body might change
        // But because the cost is saved via the hash, that can be saved to flash memory


        let creepIDs = Object.keys(unassignedCreeps);
        let minSpawnCost = 20000;
        for (let i = 0; i < requests.length; i++) {
            let req = this.spawnQueue[requests[i]];
            if (req.sta != SP_QUEUED) {
                if (req.sta == SP_SPAWNING && !Game.creeps[req.con.n]) {
                    req.sta = SP_ERROR;
                }
                continue;
            }

            let compatibleCreep = undefined;
            let bestScore = 0;
            for (let j = 0; j < creepIDs.length; j++) {
                let context = this.spawnedCreeps[creepIDs[j]];
                let score = CompareContextCompatibility(this.spawnedCreeps[creepIDs[j]], req.con);
                if (score > bestScore) {
                    bestScore = score;
                    compatibleCreep = this.spawnedCreeps[creepIDs[j]];
                }
            }

            if (compatibleCreep) {
                // Assign the creep
                compatibleCreep.o = req.pid;
                req.sta = SP_COMPLETE;
                continue;
            }

            idToHashMap[req.id] = ConvertContextToHash(req.con);
            if (!this.spawnCosts[idToHashMap[req.id]]) {
                this.spawnCosts[idToHashMap[req.id]] = ConvertContextToSpawnCost(req.con); // Calculate the cost of the spawn and cache it.

            }
            minSpawnCost = Math.min(minSpawnCost, this.spawnCosts[idToHashMap[req.id]]);
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
                let diff = this.spawnCosts[idToHashMap[req.id]];
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
                    this.spawnedCreeps[spawnRequest.req.id] = spawnRequest.req.con;
                }
            }
        }
    }
}

class SpawnExtension extends ExtensionBase implements ISpawnExtension, ICreepRegistry {
    protected get memory(): SpawnerExtension_Memory {
        if (!Memory.spawnData) {
            this.log.warn(`Initializing CreepRunner memory`);
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
    protected get spawnedCreeps(): SDictionary<CreepContext> {
        return this.memory.spawnedCreeps;
    }

    releaseCreep(id: string): void {
        if (this.spawnedCreeps[id]) {
            this.spawnedCreeps[id].o = undefined;
        }
    }

    cancelRequest(id: string): boolean {
        if (this.spawnQueue[id]) {
            delete this.spawnQueue[id];
            return true;
        }

        return false;
    }
    getRequestStatus(id: string): SpawnState {
        if (!this.spawnQueue[id]) {
            return SP_ERROR;
        }
        let spawnRequest = this.spawnQueue[id];

        if (spawnRequest.sta == SP_SPAWNING) {
            let creep = Game.creeps[spawnRequest.con.n];
            if (creep && !creep.spawning) {
                this.spawnQueue[id].sta = SP_COMPLETE;
                spawnRequest.sta = SP_COMPLETE;
                this.spawnedCreeps[spawnRequest.id] = this.spawnQueue[id].con;
            }
        }

        return spawnRequest.sta;
    }
    getCreep(spawnRequestID: string, requestingPID: PID): CreepContext | undefined {
        let request = this.spawnedCreeps[spawnRequestID];
        if (!request || !Game.creeps[request.n] || !request.o || request.o != requestingPID) {
            return undefined;
        }
        return request;
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