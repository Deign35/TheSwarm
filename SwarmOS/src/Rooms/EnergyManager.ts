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
        lastTime: Game.time
      } as ControlledRoomRefiller_Memory);

      this.memory.refillerPID = pid;
    }

    for (let i = 0; i < this.memory.workerPIDs.length; i++) {
      if (!this.kernel.getProcessByPID(this.memory.workerPIDs[i])) {
        this.memory.workerPIDs.splice(i--, 1);
      }
    }

    let numWorkers = 3;
    if (this.room.controller) {
      if (this.room.controller.level == 2) {
        numWorkers = 8;
      } else if (this.room.controller.level == 3) {
        numWorkers = 8;
      } else if (this.room.controller.level == 4) {
        numWorkers = 5;
      }
    }

    while (this.memory.workerPIDs.length < numWorkers) {
      this.memory.workerPIDs.push(this.kernel.startProcess(CPKG_Worker, {
        roomID: this.memory.roomID,
        targetRoom: this.memory.roomID,
        expires: true
      } as Worker_Memory))
    }

    if (this.roomData.mineralIDs.length > 0 && this.roomData.structures[STRUCTURE_EXTRACTOR].length > 0 &&
      (!this.memory.mineralHarvesterPID || !this.kernel.getProcessByPID(this.memory.mineralHarvesterPID))) {
      let extractor = Game.getObjectById<StructureExtractor>(this.roomData.structures[STRUCTURE_EXTRACTOR][0]);
      if (extractor) {
        let pid = this.kernel.startProcess(CPKG_MineralHarvester, {
          roomID: this.memory.roomID,
          squad: [{}, {}],
          targetRoom: this.memory.roomID,
        } as MineralHarvester_Memory);
        this.memory.mineralHarvesterPID = pid;
      }
    }

    return ThreadState_Done;
  }
}