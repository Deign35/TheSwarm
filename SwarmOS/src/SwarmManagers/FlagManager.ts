declare var Memory: {
    flagData: FlagMemory
}

import { ProcessBase, ExtensionBase } from "Core/BasicTypes";

export const bundle: IPosisBundle<FlagMemory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(PKG_FlagManager, FlagManager);
        extensionRegistry.register(EXT_Flags, FlagExtension);
    },
    rootImageName: PKG_FlagManager
}
const PKG_FlagManager_LogContext: LogContext = {
    logID: PKG_FlagManager,
    logLevel: LOG_DEBUG
}

class FlagManager extends ProcessBase {
    protected OnLoad(): void { }
    constructor(protected context: IPosisProcessContext) {
        super(context);
        Logger.CreateLogContext(PKG_FlagManager_LogContext);
    }
    protected get memory() {
        return Memory.flagData;
    }
    protected get log() {
        return this._logger;
    }
    private _logger: ILogger = {
        alert: (message: (string | (() => string))) => { Logger.alert(message, PKG_FlagManager); },
        debug: (message: (string | (() => string))) => { Logger.debug(message, PKG_FlagManager); },
        error: (message: (string | (() => string))) => { Logger.error(message, PKG_FlagManager); },
        fatal: (message: (string | (() => string))) => { Logger.fatal(message, PKG_FlagManager); },
        info: (message: (string | (() => string))) => { Logger.info(message, PKG_FlagManager); },
        trace: (message: (string | (() => string))) => { Logger.trace(message, PKG_FlagManager); },
        warn: (message: (string | (() => string))) => { Logger.warn(message, PKG_FlagManager); },
        CreateLogContext: Logger.CreateLogContext,
        DumpLogToConsole: Logger.DumpLogToConsole
    }

    handleMissingMemory() {
        if (!Memory.flagData) {
            Memory.flagData = {};
        }
        return Memory.flagData;
    }
    executeProcess(): void {
        for (let id in Game.flags) {
            let flagProcess;
            let flagPID = this.memory[id];
            if (flagPID) {
                flagProcess = this.kernel.getProcessById(flagPID);
            }
            if (!flagProcess) {
                let flagContext: FlagProcess_Memory = {
                    flagID: id
                }
                let newPID = this.kernel.startProcess(PKG_FlagBase, flagContext);
                if (!newPID || !newPID.pid || !newPID.process) {
                    this.log.error(`Failed to create a flag process (${Game.flags[id].name})`);
                    continue;
                }
                this.memory[id] = newPID.pid;
            }
        }
    }
}

class FlagExtension extends ExtensionBase {
    protected get memory(): FlagMemory {
        return Memory.flagData;
    }
}
