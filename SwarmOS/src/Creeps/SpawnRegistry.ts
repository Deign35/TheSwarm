import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SpawnRegistry, SpawnRegistry);
    }
}

const PKG_SpawnRegistry_LogContext: LogContext = {
    logID: PKG_SpawnRegistry,
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

// (TODO) -- Convert this to auto generated -- maybe also optional ordering??
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

    protected OnProcessInstantiation() {
        this.extensions.register(EXT_SpawnRegistry, new SpawnRegistryExtensions(this.extensions, this.memory));
    }

    protected get logID(): string {
        return PKG_SpawnRegistry_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_SpawnRegistry_LogContext.logLevel!;
    }
    protected get cache(): SpawnRegistry_FlashMemory {
        return super.cache as SpawnRegistry_FlashMemory;
    }

    protected get activeRequests() {
        return this.cache.activeRequests;
    }
    protected get activeSpawns() {
        return this.cache.activeSpawns;
    }
    protected get usedRequestIDs() {
        return this.cache.usedRequestIDs;
    }
    protected get sortedSpawnIDs() {
        return this.cache.sortedSpawnIDs;
    }

    protected set sortedSpawnIDs(ids: SpawnID[]) {
        this.cache.sortedSpawnIDs = ids;
    }
    protected set usedRequestIDs(ids: SpawnRequestID[]) {
        this.cache.usedRequestIDs = ids;
    }

    // Get the state of the tick before processing
    protected InitCache(): SpawnRegistry_FlashMemory {
        return {
            activeRequests: {},
            activeSpawns: {},
            sortedSpawnIDs: [],
            usedRequestIDs: []
        }
    }

    protected PopuplateCacheData() {
        let requests = Object.keys(this.memory);
        let minSpawnCost = 36000;
        for (let i = 0; i < requests.length; i++) {
            let req = this.memory[requests[i]];
            if (req.sta != SP_QUEUED) {
                if (req.sta == SP_SPAWNING && !Game.creeps[req.con.n]) {
                    req.sta = SP_ERROR;
                }
                continue;
            }
            this.activeRequests[requests[i]] = req;
            minSpawnCost = Math.min(minSpawnCost, CreepBodies.get(req.con.b)[req.con.l].cost);
        }

        let spawnIDs = Object.keys(Game.spawns);

        for (let i = 0, length = spawnIDs.length; i < length; i++) {
            let spawn = Game.spawns[spawnIDs[i]];
            if (spawn.isActive() && !spawn.spawning && spawn.room.energyAvailable >= minSpawnCost) {
                this.activeSpawns[spawnIDs[i]] = spawn;
            }
        }

        let sortedSpawnIDs = Object.keys(this.activeSpawns).sort((a, b) => {
            return this.activeSpawns[a].room.energyAvailable > this.activeSpawns[b].room.energyAvailable ? -1 : 1;
        });
    }

    executeProcess(): void {
        this.log.debug(`Begin Spawner`);
        this.PopuplateCacheData();

        let requests = Object.keys(this.memory);
        if (requests.length == 0) {
            // Inform the temp worker group
            this.log.warn(`No spawn requests in the queue.  You have spawn capacity available.`);
            return;
        }

        for (let i = 0; i < this.sortedSpawnIDs.length; i++) {
            let spawn = this.activeSpawns[this.sortedSpawnIDs[i]];
            let spawnRequest: { req?: SpawnRequest, diff: number } = { req: undefined, diff: 0 };

            let activeIDs = Object.keys(this.activeRequests);
            for (let j = 0; j < activeIDs.length; j++) {
                let req = this.memory[activeIDs[j]];
                if (spawnRequest.req && req.pri != spawnRequest.req.pri) {
                    if (req.pri > spawnRequest.req.pri) {
                        spawnRequest = { req: req, diff: this.GetConvertedSpawnCost(spawn, req) }
                    }
                    continue;
                }
                let diff = this.GetConvertedSpawnCost(spawn, req);

                if (!spawnRequest.req || diff > spawnRequest.diff) {
                    spawnRequest = { req, diff }
                }
            }

            if (spawnRequest.req && spawnRequest.diff > 0) {
                this.spawnCreep(spawn, spawnRequest.req);
            }
        }
        this.sleeper.sleep(3);
        this.log.debug(`End Spawner`);
    }

    protected spawnCreep(spawn: StructureSpawn, req: SpawnRequest) {
        let spawnResult = ERR_INVALID_ARGS as ScreepsReturnCode;
        while (spawnResult != OK && req.sta == SP_QUEUED) {
            // construct the body here somehow
            spawnResult = spawn.spawnCreep(ConvertContextToSpawnBody(req.con),
                req.con.n,
                { memory: req.dm });
            switch (spawnResult) {
                case (ERR_NAME_EXISTS):
                    req.con.n += `_` + (Game.time % GetRandomIndex(primes_100));
                case (OK):
                    break;
                default:
                    this.log.error(`Spawn Creep has failed (${spawnResult})`);
                    req.sta = SP_ERROR;
                    break;
            }
        }

        if (spawnResult == OK) {
            this.log.debug(`Spawn Creep successful for ${req.con.n} - pid(${req.pid})`);
            this.usedRequestIDs.push(req.id);
            req.sta = SP_SPAWNING;
        }
    }

    protected GetConvertedSpawnCost(spawn: StructureSpawn, req: SpawnRequest) {
        if (req.sta != SP_QUEUED) {
            return UNSPAWNABLE_COST;
        }
        if (this.usedRequestIDs.includes(req.id)) {
            return UNSPAWNABLE_COST;
        }
        let diff = CreepBodies.get(req.con.b)[req.con.l].cost;
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
    constructor(extRegistry: IExtensionRegistry, private _memory: SpawnRegistry_Memory) {
        super(extRegistry);
    }
    protected get memory(): SpawnRegistry_Memory {
        return this._memory
    }

    getRequestStatus(id: SpawnRequestID): SpawnState {
        if (!this.memory[id]) {
            return SP_ERROR;
        }
        let spawnRequest = this.memory[id];

        if (spawnRequest.sta == SP_SPAWNING) {
            let creep = Game.creeps[spawnRequest.con.n];
            if (creep && !creep.spawning) {
                this.memory[id].sta = SP_COMPLETE;
                spawnRequest.sta = SP_COMPLETE;
            }
        }

        return spawnRequest.sta;
    }
    getRequestContext(id: SpawnRequestID): CreepContext | undefined {
        if (this.memory[id]) {
            return this.memory[id].con;
        }

        return undefined;
    }

    resetRequest(id: SpawnRequestID, cName: CreepID, priority?: Priority, newContext?: CreepContext, defaultMemory?: any) {
        if (this.memory[id]) {
            this.memory[id].sta = SP_QUEUED;
        }
        if (priority) {
            this.memory[id].pri = priority;
        }
        if (newContext) {
            this.memory[id].con = newContext;
        }
        if (defaultMemory) {
            this.memory[id].dm = defaultMemory;
        }

        this.memory[id].con.n = cName;
    }
    cancelRequest(id: SpawnRequestID): boolean {
        if (this.memory[id]) {
            delete this.memory[id];
            return true;
        }

        return false;
    }

    giveRequestToPID(id: SpawnRequestID, pid: PID) {
        this.memory[id].con.o = pid;
    }
    requestSpawn(context: CreepContext, location: RoomID, requestorPID: PID, spawnPriority: Priority,
        maxSpawnDistance: number = 3, startMem?: any): SpawnRequestID {
        let newRequest: SpawnRequest = {
            con: context,
            dm: startMem,
            id: GetSUID(),
            loc: location,
            max: maxSpawnDistance,
            pid: requestorPID,
            pri: spawnPriority,
            sta: SP_QUEUED,
        }

        this.memory[newRequest.id] = newRequest;
        return newRequest.id;
    }
}