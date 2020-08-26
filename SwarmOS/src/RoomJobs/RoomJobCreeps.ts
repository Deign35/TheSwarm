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
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
  protected get logID(): string {
    return RJ_Creeps_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return RJ_Creeps_LogContext.logLevel;
  }

  RunThread(): ThreadState {
    try {
      let harvesterProcess = this.kernel.getProcessByPID(this.memory.harvester);
      if (!harvesterProcess) {
        let sourceIDs = this.roomManager.GetRoomData(this.memory.room)?.sourceIDs;
        if (sourceIDs) {
          let sources = {};
          for (let i = 0; i < sourceIDs.length; i++) {
            sources[sourceIDs[i]] = "";
          }
          this.kernel.startProcess(CJ_Harvester, {
            room: this.memory.room,
            creepIDs: [],
            sources: sources,
            spawnIDs: []
          } as HarvesterJob_Memory);
        }
      }
    } catch (ex) {
      this.log.info(`An exception occurred while trying experimental stuff (${ex})`);
    }
    return ThreadState_Done;
  }
}