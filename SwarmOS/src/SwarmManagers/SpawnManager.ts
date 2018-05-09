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

// Spawn queue order, pre organized priorities and excludes Priority.Hold which is not a valid spawn priority.
const queueOrder = [
    Priority.EMERGENCY,
    Priority.Highest,
    Priority.High,
    Priority.Medium,
    Priority.Low,
    Priority.Lowest
];

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
                queue: [],
                scheduledSpawn: {}
            };
            for (let i = 0; i < queueOrder.length; i++) {
                Memory.spawnData.queue[queueOrder[i]] = [];
            }
        }
    }

    executeProcess(): void {
        let minSpawnSize = 0;
        let availableSpawns: SDictionary<StructureSpawn> = {};

        let allSpawnIDs = Object.keys(Game.spawns);
        for (let i = 0, length = allSpawnIDs.length; i < length; i++) {
            let spawn = Game.spawns[allSpawnIDs[i]];
            if (spawn.isActive() && !spawn.spawning) {
                availableSpawns[allSpawnIDs[i]] = spawn;
            }
        }
        let availableSpawnIDs = Object.keys(availableSpawns);
        let availableSpawnCount = availableSpawnIDs.length;

        for (let i = 0; i < queueOrder.length; i++) {
            let queue = this.memory.queue[queueOrder[i]]; // (TODO): Verify my assumption: This is already sorted
            let unspawnables: SpawnData_SpawnCard[] = [];
            while (queue.length > 0) {
                if (availableSpawnIDs.length == 0) {
                    this.log.debug(`There are no remaining available spawns to spawn from`);
                    while (queue.length > 0) {
                        unspawnables.push(queue.shift()!);
                    }
                    this.memory[queueOrder[i]] = unspawnables;
                    // (TODO): Put to sleep until a spawn is freed up.
                    return;
                }

                let curReq = queue.shift(); // Because this is already sorted, this will be the hardest to spawn by cost
                if (!curReq) { continue; }

                // If I can't spawn it, hang on to it to be put back in when we're done.
                if (curReq.body.cost < minSpawnSize) {
                    unspawnables.push(curReq);
                    continue;
                }

                // Sort the available spawns by available energy
                availableSpawnIDs = availableSpawnIDs.sort((a, b) => {
                    return availableSpawns[a].room.energyCapacityAvailable > availableSpawns[b].room.energyCapacityAvailable ? -1 : 1;
                });

                let closestSpawn = Game.map.getRoomLinearDistance(curReq.location, availableSpawns[availableSpawnIDs[0]].room.name);
                for (let j = 0; j < availableSpawnCount; j++) {
                    let spawn = availableSpawns[allSpawnIDs[j]];
                    if (spawn.room.energyCapacityAvailable < curReq.body.cost) {

                    }
                }

                this.log.debug(`Successfully spawned a thing`);
            }

            if (unspawnables.length > 0) {
                this.memory[queueOrder[i]] = unspawnables;
                //If the spawn couldn't spawn because of lack of energy, spawns on the next level wont spawn if they cost more than the min
                //If the spawn couldn't spawn because of something else, next spawns that cost more won't be blocked by this
                minSpawnSize = queue[0].body.cost;
                continue;
            }
        }
    }
}

class SpawnExtension extends ExtensionBase implements IPosisSpawnExtension {
    spawnCreep(opts: SpawnData_SpawnCard): string {
        throw new Error("Method not implemented.");
    }
    getStatus(id: string): { status: EPosisSpawnStatus; message?: string | undefined; } {
        throw new Error("Method not implemented.");
    }
    getCreep(id: string): Creep | undefined {
        throw new Error("Method not implemented.");
    }
    cancelCreep(id: string): boolean {
        throw new Error("Method not implemented.");
    }
    protected get memory(): SpawnData_Memory {
        return Memory.spawnData;
    }

}
