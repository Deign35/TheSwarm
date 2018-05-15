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
//                                                                                           LTOE = Less than or equal (e.g. the creep is bigger than required)
const CompareContextCompatibility = function (context: CreepContext, creep: Creep, strictLTOE: boolean = false) {
    let score = 0;

    let desiredCreepDef = CreepBodies.get(context.b)[context.l];
    for (let bodyID in BodyLegend) {
        let desiredCount = desiredCreepDef[bodyID] || 0;
        let hasCount = creep.getActiveBodyparts(BodyLegend[bodyID]) || 0;
        if (desiredCount > 0 || hasCount > 0) {
            if (desiredCount == 0 || hasCount == 0 || (strictLTOE && desiredCount > hasCount)) {
                return 0;
            }
        }

        score += BODYPART_COST[BodyLegend[bodyID]] * Math.abs(desiredCount - hasCount);
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
            let spawnID = spawnedIDs[i] as SpawnRequestID;
            let creepContext = this.spawnedCreeps[spawnID];
            let creepName = creepContext.n;
            let creep = Game.creeps[creepName];
            if (!creep) {
                delete this.spawnedCreeps[creepName];
            }
            // (TODO): Find a way to clear dead spawn requests
            if (!this.spawnedCreeps[spawnID].o || !this.kernel.getProcessById(this.spawnedCreeps[spawnID].o!)) {
                debugger;
                unassignedCreeps[spawnID] = creep
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
            let compatibleIndex = '';
            let bestScore = 0;
            let creepIDs = Object.keys(unassignedCreeps);
            for (let j = 0; j < creepIDs.length; j++) {
                let creepReqID = creepIDs[j];
                let creep = unassignedCreeps[creepReqID];
                let score = CompareContextCompatibility(req.con, creep);
                if (score > bestScore) {
                    bestScore = score;
                    compatibleCreep = this.spawnedCreeps[creepReqID];
                    compatibleIndex = creepReqID;
                }
            }

            if (compatibleCreep) {
                this.spawnedCreeps[requests[i]] = {
                    b: compatibleCreep.b,
                    l: compatibleCreep.l,
                    n: compatibleCreep.n,
                    o: req.pid
                }
                delete unassignedCreeps[compatibleIndex];
                delete this.spawnedCreeps[compatibleIndex]
                req.sta = SP_COMPLETE;
                continue;
            }
            minSpawnCost = Math.min(minSpawnCost, CreepBodies.get(req.con.b)[req.con.l].cost); //this.spawnCosts[idToHashMap[req.id]]);
        }

        // (TODO): any remaining unassignedCreeps need something to do.
        for (let id in unassignedCreeps) {
            unassignedCreeps[id].say('I\'M LOST');
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