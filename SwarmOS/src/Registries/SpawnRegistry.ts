declare var Memory: {
    spawnData: SpawnRegistry_Memory;
}
import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SpawnRegistry, SpawnRegistry);
        extensionRegistry.register(EXT_SpawnRegistry, new SpawnRegistryExtensions(extensionRegistry));
    }
}

const PKG_SpawnRegistry_LogContext: LogContext = {
    logID: PKG_SpawnRegistry,
    logLevel: LOG_INFO
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

// (TODO) -- Convert this to auto generated -- maybe also optional ordering??
const ConvertContextToSpawnBody = function (context: SpawnContext) {
    let body = [];
    let bodyDef = CreepBodies.get(context.c)[context.l];
    for (let bodyID in BodyLegend) {
        if (bodyDef[bodyID]) {
            for (let i = 0; i < bodyDef[bodyID]; i++) {
                body.push(BodyLegend[bodyID]);
            }
        }
    }

    return body;
}

// Temporary memory
interface SpawnRegistry_FlashMemory {
    activeRequests: SDictionary<SpawnRequest>,
    activeSpawns: SDictionary<StructureSpawn>,

    usedRequestIDs: SpawnRequestID[],
    sortedSpawnIDs: SpawnID[]
}
class SpawnRegistry extends BasicProcess<SpawnRegistry_Memory> {
    @extensionInterface(EXT_SpawnRegistry)
    Extensions!: SpawnRegistryExtensions;
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;

    get memory() {
        if (!Memory.spawnData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.spawnData = {}
        }
        return Memory.spawnData;
    }

    protected get logID(): string {
        return PKG_SpawnRegistry_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_SpawnRegistry_LogContext.logLevel!;
    }

    protected AnalyzeSpawnRequests(): SpawnRegistry_FlashMemory {
        let requests = Object.keys(this.memory);
        let minSpawnCost = 36000;
        let activeRequests = {};

        for (let i = 0; i < requests.length; i++) {
            let req = this.memory[requests[i]];
            if (req.spSta != SP_QUEUED) {
                if (req.spSta == SP_SPAWNING) {
                    if (!Game.creeps[req.con.n]) {
                        req.spSta = SP_ERROR;
                    } else if (!Game.creeps[req.con.n].spawning) {
                        req.spSta = SP_COMPLETE;
                    }
                }
                continue;
            }

            let foundCreep = this.creepRegistry.tryFindCompatibleCreep(req.con.c, req.con.l, req.loc, req.max);
            if (foundCreep) {
                this.log.info(`Found a compatible creep instead of spawning`);
                req.con.n = foundCreep;
                req.spSta = SP_COMPLETE;
                this.creepRegistry.releaseCreep(foundCreep);
                this.creepRegistry.tryReserveCreep(foundCreep, req.con.p);
                continue;
            } else {
                activeRequests[requests[i]] = req;
                minSpawnCost = Math.min(minSpawnCost, CreepBodies.get(req.con.c)[req.con.l].cost);
            }
        }

        let spawnIDs = Object.keys(Game.spawns);
        let activeSpawns = {};

        for (let i = 0, length = spawnIDs.length; i < length; i++) {
            let spawn = Game.spawns[spawnIDs[i]];
            if (spawn.isActive() && !spawn.spawning && spawn.room.energyAvailable >= minSpawnCost) {
                activeSpawns[spawnIDs[i]] = spawn;
            }
        }

        let sortedSpawnIDs = Object.keys(activeSpawns).sort((a, b) => {
            return activeSpawns[a].room.energyAvailable > activeSpawns[b].room.energyAvailable ? -1 : 1;
        });

        return {
            activeRequests,
            activeSpawns,
            sortedSpawnIDs,
            usedRequestIDs: []
        }
    }

    RunThread(): ThreadState {
        this.log.debug(`Begin Spawner`);
        let { activeRequests, activeSpawns, sortedSpawnIDs, usedRequestIDs } = this.AnalyzeSpawnRequests();

        let requests = Object.keys(this.memory);
        if (requests.length == 0) {
            // Inform the temp worker group
            //this.log.warn(`No spawn requests in the queue.  You have spawn capacity available.`);
            return ThreadState_Done;
        }

        for (let i = 0; i < sortedSpawnIDs.length; i++) {
            let spawn = activeSpawns[sortedSpawnIDs[i]] as StructureSpawn;
            let spawnRequest: { req?: SpawnRequest, diff: number } = { req: undefined, diff: 0 };
            let minPriority = Priority_Hold;

            let activeIDs = Object.keys(activeRequests);
            for (let j = 0; j < activeIDs.length; j++) {
                let req = this.memory[activeIDs[j]];
                if (usedRequestIDs.includes(req.id)) {
                    continue;
                }
                let body = CreepBodies[req.con.c][req.con.l];
                if (spawn.room.energyCapacityAvailable < body.cost) {
                    continue;
                }
                if (req.pri < minPriority) {
                    continue;
                }
                minPriority = req.pri;
                if (body.cost > spawn.room.energyAvailable) {
                    continue;
                }
                let diff = this.GetConvertedSpawnCost(spawn, req);

                if (!spawnRequest.req || diff > spawnRequest.diff || req.pri > spawnRequest.req.pri) {
                    spawnRequest = { req, diff }
                }
            }

            if (spawnRequest.req && spawnRequest.diff > 0 && spawnRequest.req.pri == minPriority) {
                if (this.spawnCreep(spawn, spawnRequest.req)) {
                    usedRequestIDs.push(spawnRequest.req.id);
                }
            }
        }
        this.sleeper.sleep(this.pid, 3);
        this.log.debug(`End Spawner`);

        return ThreadState_Done;
    }

    protected spawnCreep(spawn: StructureSpawn, req: SpawnRequest): boolean {
        let spawnResult = ERR_INVALID_ARGS as ScreepsReturnCode;
        while (spawnResult != OK && req.spSta == SP_QUEUED) {
            // construct the body here somehow
            let spawnMem = Object.assign(req.dm || {}, {
                ct: req.con.c,
                lvl: req.con.l
            })
            spawnResult = spawn.spawnCreep(ConvertContextToSpawnBody(req.con),
                req.con.n,
                { memory: spawnMem });
            switch (spawnResult) {
                case (ERR_NOT_ENOUGH_ENERGY):
                    return false;
                case (ERR_NAME_EXISTS):
                    req.con.n += `_` + (Game.time % GetRandomIndex(primes_100));
                case (OK):
                    break;
                default:
                    this.log.error(`Spawn Creep has failed (${spawnResult})`);
                    req.spSta = SP_ERROR;
                    break;
            }
        }

        if (spawnResult == OK) {
            this.log.debug(`Spawn Creep successful for ${req.id})`);
            req.spSta = SP_SPAWNING;
            return true;
        }
        return false;
    }

    protected GetConvertedSpawnCost(spawn: StructureSpawn, req: SpawnRequest) {
        if (req.spSta != SP_QUEUED) {
            return UNSPAWNABLE_COST;
        }
        let diff = CreepBodies.get(req.con.c)[req.con.l].cost;
        let dist = Game.map.getRoomLinearDistance(spawn.room.name, req.loc) || 0
        if (req.max && dist > req.max) {
            return UNSPAWNABLE_COST;
        }
        diff += E2C_MaxSpawnDistance * (req.max || 0);
        diff -= E2C_SpawnDistance * dist;

        return diff || UNSPAWNABLE_COST;
    }
}
const UNSPAWNABLE_COST = -1;

class SpawnRegistryExtensions extends ExtensionBase implements ISpawnRegistryExtensions {
    get memory(): SpawnRegistry_Memory {
        if (!Memory.spawnData) {
            this.log.warn(`Initializing RoomManager memory`);
            Memory.spawnData = {}
        }
        return Memory.spawnData;
    }

    getRequestStatus(id?: SpawnRequestID): SpawnState {
        if (!id || !this.memory[id]) {
            return SP_ERROR;
        }
        let spawnRequest = this.memory[id];

        if (spawnRequest.spSta == SP_SPAWNING) {
            let creep = Game.creeps[spawnRequest.con.n];
            if (creep && !creep.spawning) {
                this.memory[id].spSta = SP_COMPLETE;
                spawnRequest.spSta = SP_COMPLETE;
            }
        }

        return spawnRequest.spSta;
    }
    getRequestContext(id?: SpawnRequestID): SpawnContext | undefined {
        if (id && this.memory[id]) {
            return this.memory[id].con;
        }

        return undefined;
    }

    cancelRequest(id?: SpawnRequestID): boolean {
        if (id && this.memory[id]) {
            delete this.memory[id];
            return true;
        }

        return false;
    }

    requestSpawn(context: SpawnContext, location: RoomID, spawnPriority: Priority,
        maxSpawnDistance: number = 3, startMem?: any): SpawnRequestID {
        let newRequest: SpawnRequest = {
            con: context,
            dm: startMem,
            id: GetSUID(),
            loc: location,
            max: maxSpawnDistance,
            pri: spawnPriority,
            spSta: SP_QUEUED,
        }

        this.memory[newRequest.id] = newRequest;
        return newRequest.id;
    }
}