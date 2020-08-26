export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_EnergyManager, EnergyManager);
  }
}
import { BasicProcess } from "Core/BasicTypes";

const RPKG_EnergyManager_LogContext: LogContext = {
  logID: RPKG_EnergyManager,
  logLevel: LOG_TRACE
}

class EnergyManager extends BasicProcess<EnergyManagerMemory> {
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  protected get logID(): string {
    return RPKG_EnergyManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return RPKG_EnergyManager_LogContext.logLevel;
  }
  get room() {
    return Game.rooms[this.memory.roomID];
  }
  get roomData() {
    return this.roomManager.GetRoomData(this.memory.roomID)!;
  }

  RunThread(): ThreadState {
    let sourceIDs = this.roomData.sourceIDs;
    for (let i = 0; i < sourceIDs.length; i++) {
      if (!this.memory.harvesterPIDs[sourceIDs[i]] ||
        !this.kernel.getProcessByPID(this.memory.harvesterPIDs[sourceIDs[i]])) {
        let pid = this.kernel.startProcess(CPKG_Harvester, {
          roomID: this.memory.roomID,
          targetID: sourceIDs[i],
          creepID: ''
        } as HarvesterMemory);

        this.memory.harvesterPIDs[sourceIDs[i]] = pid;
      }
    }

    return ThreadState_Done;
  }
}