declare var Memory: {
    flagData: FlagExtensionsMemory
}
import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<FlagExtensionsMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_FlagManager, FlagManager);
        extensionRegistry.register(EXT_Flags, FlagExtension);
    }
}
const PKG_FlagManager_LogContext: LogContext = {
    logID: PKG_FlagManager,
    logLevel: LOG_DEBUG
}

// (TODO): Convert to Flag Registry
class FlagManager extends BasicProcess<FlagExtensionsMemory> {
    protected get memory(): FlagExtensionsMemory {
        if (!Memory.flagData) {
            this.log.warn(`Initializing FlagManager memory`);
            Memory.flagData = {}
        }
        return Memory.flagData;
    }
    protected get logID() {
        return PKG_FlagManager_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_FlagManager_LogContext.logLevel!;
    }

    executeProcess(): void {
        for (let id in Game.flags) {
            let flagProcess;
            let flagPID = this.memory[id];
            if (flagPID) {
                flagProcess = this.kernel.getProcessByPID(flagPID);
            }
            if (!flagProcess) {
                let flagContext: FlagProcess_Memory = {
                    flagID: id
                }
                this.memory[id] = this.kernel.startProcess(PKG_FlagBase, flagContext);
            }
        }
        for (let id in this.memory) {
            if (!Game.flags[id]) {
                delete this.memory[id];
            }
        }

        this.sleeper.sleep(30);
    }
}

class FlagExtension extends ExtensionBase {
    protected get memory(): FlagExtensionsMemory {
        if (!Memory.flagData) {
            this.log.warn(`Initializing FlagManager memory`);
            Memory.flagData = {}
        }
        return Memory.flagData;
    }
}
