declare var Memory: {
    spawnData: SpawnData_Memory
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
*/
import { BaseProcess } from "Core/ProcessRegistry";
import { ExtensionBase } from "Core/ExtensionRegistry";

export const IN_SpawnManager = 'SpawnManager';
export const EXT_CreepSpawnExtension = 'CreepSpawner'; // Added to BaseProcess

export const bundle: IPosisBundle<SpawnData_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(IN_SpawnManager, SpawnManager);
        let SpawnManagerExtension = new SpawnExtension(extensionRegistry);
        extensionRegistry.register(EXT_CreepSpawnExtension, SpawnManagerExtension);
    },
    rootImageName: IN_SpawnManager
}

const SpawnManager_LogContext: LogContext = {
    logID: IN_SpawnManager,
    logLevel: LOG_TRACE
}
//const FRE_RoomStructures = primes_100[10]; // 10 = 29
class SpawnManager extends BaseProcess {
    constructor(protected context: IPosisProcessContext) {
        super(context);
        Logger.CreateLogContext(SpawnManager_LogContext);
    }

    protected get memory() {
        return Memory.spawnData;
    }
    protected get log() {
        return this._logger;
    }
    private _logger: ILogger = {
        alert: (message: (string | (() => string))) => { Logger.alert(message, IN_SpawnManager); },
        debug: (message: (string | (() => string))) => { Logger.debug(message, IN_SpawnManager); },
        error: (message: (string | (() => string))) => { Logger.error(message, IN_SpawnManager); },
        fatal: (message: (string | (() => string))) => { Logger.fatal(message, IN_SpawnManager); },
        info: (message: (string | (() => string))) => { Logger.info(message, IN_SpawnManager); },
        trace: (message: (string | (() => string))) => { Logger.trace(message, IN_SpawnManager); },
        warn: (message: (string | (() => string))) => { Logger.warn(message, IN_SpawnManager); },
        CreateLogContext: Logger.CreateLogContext,
        DumpLogToConsole: Logger.DumpLogToConsole
    }

    handleMissingMemory() {
        if (!Memory.spawnData) {
            this.log.warn(`Initializing memory`);
            Memory.spawnData = {
                queue: {},
                scheduledSpawn: {}
            }
        }
    }

    // (TODO) Scale this appropriately
    protected calculateSpawnDifficulty(req: SpawnData_SpawnCard, spawn?: StructureSpawn) {
        let canSpawn = req.spawnState == EPosisSpawnStatus.QUEUED;
        let difficulty = req.body.cost;
        // Multiply by a factor of the max distance
        if (req.maxSpawnDist) {
            difficulty *= (E2C_MaxSpawnDistance / req.maxSpawnDist);
        }

        if (spawn) {
            canSpawn = false;
            let spawnDistance = Game.map.getRoomLinearDistance(spawn.room.name, req.location);
            if (!req.maxSpawnDist || req.maxSpawnDist >= spawnDistance) {
                if (req.body.cost <= spawn.room.energyCapacityAvailable) {
                    canSpawn = true;
                    // Multiply by a factor of the actual distance
                    difficulty *= E2C_SpawnDistance * (spawnDistance || 1);
                }
            }
        }

        return (canSpawn) ? difficulty : -1;
    }

    executeProcess(): void {
        let availableSpawns: SDictionary<StructureSpawn> = {};

        let allSpawnIDs = Object.keys(Game.spawns);
        for (let i = 0, length = allSpawnIDs.length; i < length; i++) {
            let spawn = Game.spawns[allSpawnIDs[i]];
            if (spawn.isActive() && !spawn.spawning) {
                availableSpawns[allSpawnIDs[i]] = spawn;
            }
        }
        let sortedSpawns = Object.keys(availableSpawns).sort((a, b) => {
            return availableSpawns[a].room.energyCapacityAvailable > availableSpawns[b].room.energyCapacityAvailable ? -1 : 1;
        });
        let sortedRequests = Object.keys(this.memory.queue).sort((a, b) => {
            let reqA = this.memory.queue[a];
            let reqB = this.memory.queue[b];
            if (reqA.spawnState != EPosisSpawnStatus.QUEUED) {
                return 1;
            }
            if (reqB.spawnState != EPosisSpawnStatus.QUEUED) {
                return -1;
            }

            if (reqA.priority != reqB.priority) {
                return reqA.priority > reqB.priority ? -1 : 1;
            }

            let aDiff = this.calculateSpawnDifficulty(reqA);
            let bDiff = this.calculateSpawnDifficulty(reqB);

            return aDiff > bDiff ? -1 : 1;
        });

        this.log.debug(`AvailableSpawnerCount(${sortedSpawns.length}) - SpawnRequestCount(${sortedRequests.length})`);
        for (let i = 0; i < sortedSpawns.length; i++) {
            let spawnRequest: { req?: SpawnData_SpawnCard, diff: number } = { req: undefined, diff: 0 };
            let spawn = availableSpawns[sortedSpawns[i]];

            for (let j = 0; j < sortedRequests.length; j++) {
                let req = this.memory.queue[sortedRequests[j]];
                let diff = this.calculateSpawnDifficulty(req, spawn);

                // If this request is eligible for this spawn, then get difficulty
                if (!spawnRequest.req || diff > spawnRequest.diff) {
                    spawnRequest = { req, diff }
                }
            }

            if (spawnRequest.req && spawnRequest.diff > 0) {
                // Spawn it
                let spawnResult = ERR_INVALID_ARGS as ScreepsReturnCode;
                while (spawnResult != OK && spawnRequest.req.spawnState == EPosisSpawnStatus.QUEUED) {
                    spawnResult = spawn.spawnCreep(spawnRequest.req.body.body,
                        spawnRequest.req.creepName,
                        { memory: spawnRequest.req.defaultMemory });
                    switch (spawnResult) {
                        case (ERR_NAME_EXISTS):
                            spawnRequest.req.creepName += `_` + (Game.time % GetRandomIndex(primes_100));
                            break;
                        default:
                            this.log.error(`Spawn Creep has failed (${spawnResult})`);
                            spawnRequest.req.spawnState = EPosisSpawnStatus.ERROR;
                            spawnRequest.req.spawner = `Spawn failed ${spawnResult}`;
                            break;
                    }
                }

                if (spawnResult == OK) {
                    this.log.debug(`Spawn Creep successful for ${spawnRequest.req.creepName} - pid(${spawnRequest.req.pid})`);
                    spawnRequest.req.spawnState = EPosisSpawnStatus.SPAWNING;
                    spawnRequest.req.spawner = spawn.id;
                } else {
                }
            }
        }
    }
}

class SpawnExtension extends ExtensionBase implements IPosisSpawnExtension {
    cancelCreep(id: string): boolean {
        if (this.getStatus(id).status == EPosisSpawnStatus.QUEUED) {
            delete this.memory.queue[id];
            return true;
        }

        return false;
    }
    getCreep(id: string): Creep | undefined {
        if (Game.creeps[id]) {
            return Game.creeps[id];
        } else {
            return;
        }
    }
    getStatus(id: string): { status: EPosisSpawnStatus; message?: string | undefined; } {
        return { status: this.memory.queue[id].spawnState, message: this.memory.queue[id].spawner }
    }

    spawnCreep(opts: SpawnData_SpawnCard): string {
        if (Game.creeps[opts.creepName] || this.memory.queue[opts.creepName]) {
            return '';
        }
        this.memory.queue[opts.creepName] = opts;
        return opts.creepName;
    }
    protected get memory(): SpawnData_Memory {
        return Memory.spawnData;
    }
}