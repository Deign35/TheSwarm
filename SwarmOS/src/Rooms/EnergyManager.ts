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
          roomID: this.room.name,
          source: sourceIDs[i],
          targetRoom: this.room.name,
        } as HarvesterMemory);

        this.memory.harvesterPIDs[sourceIDs[i]] = pid;
      }
    }

    if (!this.memory.refillerPID ||
      !this.kernel.getProcessByPID(this.memory.refillerPID)) {
      let pid = this.kernel.startProcess(CPKG_ControlledRoomRefiller, {
        roomID: this.room.name,
        targetRoom: this.room.name,
      } as ControlledRoomRefiller_Memory);

      this.memory.refillerPID = pid;
    }

    /*let mineralIDs = this.roomData.mineralIDs;
    for (let i = 0; i < mineralIDs.length; i++) {
      let extractor = this.room.lookForAt(LOOK_STRUCTURES, Game.getObjectById(mineralIDs[i]) as Mineral);
      if (extractor.length > 0 && extractor[0].structureType == STRUCTURE_EXTRACTOR) {
        if (!this.memory.harvesterPIDs[mineralIDs[i]] ||
          !this.kernel.getProcessByPID(this.memory.harvesterPIDs[mineralIDs[i]])) {
            let pid = this.kernel.startProcess(CPKG_Harvester, {
              roomID: this.memory.roomID,
              targetID: mineralIDs[i],
              creepID: ''
            } as HarvesterMemory);
            this.memory.harvesterPIDs[mineralIDs[i]] = pid;
        }
      }
    }*/

    return ThreadState_Done;
  }
}