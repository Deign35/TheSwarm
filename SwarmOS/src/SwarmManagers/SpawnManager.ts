/*declare var Memory: {
    spawnData: SpawnerExtension_Memory
}

const MIN_BODY = 0;
const TINY_BODY = 1;
const SMALL_BODY = 2;
const MEDIUM_BODY = 3;
const BIG_BODY = 4;
const LARGE_BODY = 5;
const SUPER_BODY = 6;

/*
const exDef: RoleDefinition<'scout'> = {
    roleID: 'scout',
    body: [
        [MOVE],
        [TOUGH, TOUGH, TOUGH, MOVE],
        [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE],
    ]
}
// (TODO) Automate role definitions to precalculate body costs and shit
const exDef2: RoleDefinition<'harvester'> = {
    roleID: 'harvester',
    body: {
        [MIN_BODY]: [WORK, CARRY, MOVE],
        [SMALL_BODY]: [TOUGH, TOUGH, TOUGH, MOVE],
        [MEDIUM_BODY]: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE],
    }
}
*
import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const bundle: IPackage<SpawnerExtension_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SpawnManager, SpawnManager);
        let SpawnManagerExtension = new SpawnExtension(extensionRegistry);
        extensionRegistry.register(EXT_CreepSpawner, SpawnManagerExtension);
    },
    rootImageName: PKG_SpawnManager
}

const PKG_SpawnManager_LogContext: LogContext = {
    logID: PKG_SpawnManager,
    logLevel: LOG_INFO
}

//const FRE_RoomStructures = primes_100[10]; // 10 = 29
class SpawnManager extends BasicProcess {
    @extensionInterface(EXT_CreepSpawner)
    SpawnerExtensions!: SpawnExtension;

    OnOSLoad() { }

    protected get memory() {
        return Memory.spawnData;
    }
    protected get queue() {
        return this.memory.queue;
    }
    protected get logID() {
        return PKG_SpawnManager_LogContext.logID;
    }
    protected get logLevel() {
        return PKG_SpawnManager_LogContext.logLevel!;
    }

    handleMissingMemory() {
        if (!Memory.spawnData) {
            this.log.warn(`Initializing memory`);
            Memory.spawnData = {
                queue: {},
                spawnedCreeps: {}
            }
        }
    }

    // (TODO) Scale this properly
    protected calculateSpawnDifficulty(req: SpawnData_SpawnCard, spawn?: StructureSpawn) {
        let canSpawn = req.spawnState == SP_QUEUED;
        let difficulty = req.body.cost;
        // Multiply by a factor of the max distance
        if (req.maxSpawnDist) {
            difficulty *= (E2C_MaxSpawnDistance / req.maxSpawnDist);
        }

        if (spawn) {
            canSpawn = false;
            let spawnDistance = Game.map.getRoomLinearDistance(spawn.room.name, req.location);
            if (!req.maxSpawnDist || req.maxSpawnDist >= spawnDistance) {
                if (req.body.cost <= spawn.room.energyAvailable) {
                    canSpawn = true;
                    // Multiply by a factor of the actual distance
                    difficulty *= E2C_SpawnDistance * (spawnDistance || 1);
                }
            }
        }
        difficulty += req.priority * 1000;

        return ((canSpawn) ? difficulty : -1);
    }

    executeProcess(): void {
        if (Object.keys(this.memory.queue).length == 0) {
            this.log.warn(`No spawn requests in the queue.  You have spawn capacity available.`);
            return;
        }

        let minSpawnCost = 20000;
        let keys = Object.keys(this.queue);
        for (let i = 0; i < keys.length; i++) {
            minSpawnCost = Math.min(minSpawnCost, this.queue[keys[i]].body.cost);
        }
        let availableSpawns: SDictionary<StructureSpawn> = {};

        let allSpawnIDs = Object.keys(Game.spawns);
        for (let i = 0, length = allSpawnIDs.length; i < length; i++) {
            let spawn = Game.spawns[allSpawnIDs[i]];
            if (spawn.isActive() && !spawn.spawning && spawn.room.energyAvailable >= minSpawnCost) {
                availableSpawns[allSpawnIDs[i]] = spawn;
            }
        }

        let sortedRequests = Object.keys(this.memory.queue).sort((a, b) => {
            let reqA = this.memory.queue[a];
            let reqB = this.memory.queue[b];
            if (reqA.spawnState != SP_QUEUED) {
                return 1;
            }
            if (reqB.spawnState != SP_QUEUED) {
                return -1;
            }

            if (reqA.priority != reqB.priority) {
                return reqA.priority > reqB.priority ? -1 : 1;
            }

            let aDiff = this.calculateSpawnDifficulty(reqA);
            let bDiff = this.calculateSpawnDifficulty(reqB);

            return aDiff > bDiff ? -1 : 1;
        });
        let sortedSpawns = Object.keys(availableSpawns).sort((a, b) => {
            return availableSpawns[a].room.energyAvailable > availableSpawns[b].room.energyAvailable ? -1 : 1;
        });

        this.log.debug(`AvailableSpawnerCount(${sortedSpawns.length}) - SpawnRequestCount(${sortedRequests.length})`);
        for (let i = 0; i < sortedSpawns.length; i++) {
            let spawnRequest: { req?: SpawnData_SpawnCard, diff: number } = { req: undefined, diff: 0 };
            let spawn = availableSpawns[sortedSpawns[i]];

            for (let j = 0; j < sortedRequests.length; j++) {
                let req = this.memory.queue[sortedRequests[j]];
                if (spawnRequest.req && req.priority != spawnRequest.req.priority) {
                    if (req.priority > spawnRequest.req.priority) {
                        spawnRequest = { req, diff: this.calculateSpawnDifficulty(req, spawn) }
                    }
                    continue;
                }
                let diff = this.calculateSpawnDifficulty(req, spawn);

                if (!spawnRequest.req || diff > spawnRequest.diff) {
                    spawnRequest = { req, diff }
                }
            }

            if (spawnRequest.req && spawnRequest.diff > 0) {
                // Spawn it
                let spawnResult = ERR_INVALID_ARGS as ScreepsReturnCode;
                while (spawnResult != OK && spawnRequest.req.spawnState == SP_QUEUED) {
                    spawnResult = spawn.spawnCreep(spawnRequest.req.body.body,
                        spawnRequest.req.creepName,
                        { memory: spawnRequest.req.defaultMemory });
                    switch (spawnResult) {
                        case (ERR_NAME_EXISTS):
                            spawnRequest.req.creepName += `_` + (Game.time % GetRandomIndex(primes_100));
                        case (OK):
                            break;
                        default:
                            this.log.error(`Spawn Creep has failed (${spawnResult})`);
                            spawnRequest.req.spawnState = SP_ERROR;
                            break;
                    }
                }

                if (spawnResult == OK) {
                    this.log.debug(`Spawn Creep successful for ${spawnRequest.req.creepName} - pid(${spawnRequest.req.pid})`);
                    spawnRequest.req.spawnState = SP_SPAWNING;
                } else {
                }
            }
        }
    }
}

class SpawnExtension extends ExtensionBase implements ISpawnExtension {
    cancelRequest(id: string): boolean {
        if (this.memory.queue[id]) {
            delete this.memory.queue[id];
            return true;
        }

        return false;
    }
    getCreep(id: string): Creep | undefined {
        if (Game.creeps[id]) {
            return Game.creeps[id];
        }

        return;
    }
    getRequestStatus(id: string): SpawnState {
        if (!this.memory.queue[id]) {
            return SP_ERROR;
        }
        let spawnCard = this.memory.queue[id];
        let spawnState = spawnCard.spawnState;

        if (spawnState == SP_SPAWNING) {
            let creep = Game.creeps[spawnCard.creepName];
            if (creep && !creep.spawning) {
                this.memory.queue[id].spawnState = SP_COMPLETE;
                spawnState = SP_COMPLETE;
            }
        }

        return spawnState;
    }

    requestCreep(opts: SpawnData_SpawnCard): string {
        if (Game.creeps[opts.creepName] || this.memory.queue[opts.creepName]) {
            return '';
        }
        this.memory.queue[opts.creepName] = opts;
        return opts.creepName;
    }
    protected get memory(): SpawnerExtension_Memory {
        return Memory.spawnData;
    }
}*/