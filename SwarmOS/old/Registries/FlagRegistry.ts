declare var Memory: {
    flagData: FlagExtensionsMemory
}
import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage<FlagExtensionsMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_FlagManager, FlagRegistry);
        extensionRegistry.register(EXT_Flags, FlagRegistryExtensions);
    }
}
const PKG_FlagRegistry_LogContext: LogContext = {
    logID: PKG_FlagManager,
    logLevel: LOG_INFO
}

class FlagRegistry extends BasicProcess<FlagExtensionsMemory> {
    get memory(): FlagExtensionsMemory {
        if (!Memory.flagData) {
            this.log.warn(`Initializing FlagRegistry memory`);
            Memory.flagData = {}
        }
        return Memory.flagData;
    }
    protected get logID() {
        return PKG_FlagRegistry_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return PKG_FlagRegistry_LogContext.logLevel!;
    }

    RunThread(): ThreadState {
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

        this.sleeper.sleep(this.pid, 30);

        return ThreadState_Done;
    }
}

class FlagRegistryExtensions extends ExtensionBase {
    get memory(): FlagExtensionsMemory {
        if (!Memory.flagData) {
            this.log.warn(`Initializing FlagManager memory`);
            Memory.flagData = {}
        }
        return Memory.flagData;
    }
}
