export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RJ_Creeps, RoomJobCreeps);
  }
}

import { BasicProcess } from "Core/BasicTypes";

const PKG_EmptyProcess_LogContext: LogContext = {
  logID: RJ_Creeps,
  logLevel: LOG_INFO
}

class RoomJobCreeps extends BasicProcess<IRoomJobCreeps_Memory> implements IRoomJobCreeps {
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