export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RJ_Creeps, RoomJobCreeps);
  }
}

import { BasicProcess } from "Core/BasicTypes";

const RJ_Creeps_LogContext: LogContext = {
  logID: RJ_Creeps,
  logLevel: LOG_INFO
}

class RoomJobCreeps extends BasicProcess<IRoomJobCreeps_Memory> implements IRoomJobCreeps {
  protected get logID(): string {
    return RJ_Creeps_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return RJ_Creeps_LogContext.logLevel;
  }
  SurrenderCreep(creepID: string): void {
  }
  RunThread(): ThreadState {
    try {

    } catch (ex) {
      this.log.info(`An exception occurred while trying experimental stuff (${ex})`);
    }
    return ThreadState_Done;
  }
}