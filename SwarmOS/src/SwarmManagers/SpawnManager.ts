declare var Memory: {
    spawnData: SpawnData_Memory
}

import { BaseProcess } from "Core/ProcessRegistry";
import { ExtensionBase } from "Core/ExtensionRegistry";

export const IN_SpawnManager = 'SpawnManager';
export const EXT_CreepSpawnExtension = 'CreepSpawner'; // Added to BaseProcess

export const bundle: IPosisBundle<SpawnData_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(IN_SpawnManager, SpawnManager);
        extensionRegistry.register(EXT_CreepSpawnExtension, new SpawnExtension(extensionRegistry));
    },
    rootImageName: IN_SpawnManager
}

// Spawn queue order, pre organized priorities and excludes Priority.Hold which is not a valid spawn priority.
const queueOrder = [Priority.EMERGENCY, Priority.Highest, Priority.High, Priority.Medium, Priority.Low, Priority.Lowest];

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
            Memory.spawnData = {
                [Priority.EMERGENCY]: [],
                [Priority.Highest]: [],
                [Priority.High]: [],
                [Priority.Medium]: [],
                [Priority.Low]: [],
                [Priority.Lowest]: []
            };
        }
        return Memory.spawnData;
    }
    
    executeProcess(): void {
        this.log.alert(`Start`);
        this.log.debug(`Get Queues`);
        this.log.debug(`Find the highest priority queue that has requests --- Req[Pri(X)]`);

        let checkNextQueue = true;
        let minSpawnSize = 100000;
        let availableSpawns: SDictionary<StructureSpawn> = {};

        let allIDs = Object.keys(Game.spawns);
        for (let i = 0, length = allIDs.length; i < length; i++) {
            let spawn = Game.spawns[allIDs[i]];
            if (spawn.isActive() && !spawn.spawning) {
                availableSpawns[allIDs[i]] = spawn;
            }
        }

        for (let i = 0; i < queueOrder.length; i++) {
            let queue = this.memory[queueOrder[i]]; // assume its already sorted
            let unspawnables: SpawnData_SpawnCard[] = [];
            while (queue.length > 0) {
                this.log.debug(`Try to spawn everything in X`);
                let curReq = queue[0];
                if (curReq) {
                    this.log.debug(`Try to find a spawn that can fulfill the request`);

                    let ids = Object.keys(availableSpawns).sort((a, b) => {
                        return availableSpawns[a].room.energyCapacityAvailable > availableSpawns[b].room.energyCapacityAvailable ? -1 : 1;
                    });

                    for (let j = 0; j < ids.length; j++) {
                        let spawn = allIDs[j];
                    }
                }

                this.log.debug(`Successfully spawned a thing`);
                queue.shift();

                this.log.debug(`Check if there are any available spawns here and break if no?`);
            }

            if (!checkNextQueue) {
                this.log.debug(`After checking Req[Pri(X - 1)] quit trying to spawn things`)
                break;
            }

            this.log.debug(`If its because the queue could not be depleted (due to not enough energy or an open spawner)`);
            if (unspawnables.length > 0) {
                this.memory[queueOrder[i]] = unspawnables;
                this.log.debug(`Then go again, but with Req[Pri(X - 1)] and do not repeat again after.`);
                checkNextQueue = false;
                this.log.debug(`If the spawn couldn't spawn because of lack of energy, spawns on the next level wont spawn if they cost more than the min`)
                minSpawnSize = GetSpawnCost(queue[0].body);
                this.log.debug(`If the spawn couldn't spawn because of something else, next spawns that cost more won't be blocked by this`);
                continue;
            }
            this.log.debug(`When you can't spawn anymore, if cause queue is empty, start over.`);
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
