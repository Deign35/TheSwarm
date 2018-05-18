declare var Memory: {
    flagData: FlagExtensionsMemory
}
import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const bundle: IPackage<FlagExtensionsMemory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_FlagManager, FlagManager);
        extensionRegistry.register(EXT_Flags, FlagExtension);
    }
}
const PKG_FlagManager_LogContext: LogContext = {
    logID: PKG_FlagManager,
    logLevel: LOG_DEBUG
}

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
                let newPID = this.kernel.startProcess(PKG_FlagBase, flagContext);
                if (!newPID || !newPID.pid || !newPID.process) {
                    this.log.error(`Failed to create a flag process (${Game.flags[id].name})`);
                    continue;
                }
                this.memory[id] = newPID.pid;
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
