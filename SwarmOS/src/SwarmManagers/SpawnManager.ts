declare var Memory: {
    spawnData: SpawnData_Memory
}

import { BaseProcess } from "Core/ProcessRegistry";
import { ExtensionBase } from "Core/ExtensionRegistry";

export const IN_SpawnManager = 'SpawnManager';

export const bundle: IPosisBundle<SpawnData_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(IN_SpawnManager, SpawnManager);
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
            Memory.spawnData = {};
        }
        return Memory.spawnData;
    }
    executeProcess(): void {
        this.log.alert(`Start`);
        this.log.debug(`Get Queues`);
        this.log.debug(`Find the highest priority queue that has requests --- Req[Pri(X)]`);
        this.log.debug(`Try to spawn everything in X`);
        this.log.debug(`When you can't spawn anymore, if cause queue is empty, start over.`);
        this.log.debug(`If its because the queue could not be depleted (due to not enough energy or an open spawner)`);
        this.log.debug(`Then go again, but with Req[Pri(X - 1)] and do not repeat again after.`)
    }
}

class SpawnExtension extends ExtensionBase {
    protected get memory(): SpawnData_Memory {
        return Memory.spawnData;
    }
}
