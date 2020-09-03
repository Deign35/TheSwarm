declare var Memory: {
  flagData: FlagManagerMemory
}
import { BasicProcess } from "Core/BasicTypes";

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_FlagManager, FlagManager);
  }
}
const PKG_FlagManager_LogContext: LogContext = {
  logID: PKG_FlagManager,
  logLevel: LOG_INFO
}

class FlagManager extends BasicProcess<FlagManagerMemory> {
  get memory(): FlagManagerMemory {
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

  RunThread(): ThreadState {
    for (let id in Game.flags) {
      let flagProcess;
      const flagPID = this.memory[id];
      if (flagPID) {
        flagProcess = this.kernel.getProcessByPID(flagPID);
      }
      if (!flagProcess) {
        const flagContext: FlagProcess_Memory = {
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