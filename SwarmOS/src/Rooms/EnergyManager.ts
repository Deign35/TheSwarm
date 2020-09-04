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

  RunThread(): ThreadState {
    const room = Game.rooms[this.memory.roomID];
    const roomData = this.roomManager.GetRoomData(this.memory.roomID)!;
    const sourceIDs = roomData.sourceIDs;
    for (let i = 0; i < sourceIDs.length; i++) {
      if (!this.memory.harvesterPIDs[sourceIDs[i]] ||
        !this.kernel.getProcessByPID(this.memory.harvesterPIDs[sourceIDs[i]])) {
        const pid = this.kernel.startProcess(CPKG_Harvester, {
          roomID: this.memory.roomID,
          source: sourceIDs[i],
          targetRoom: this.memory.roomID,
        } as HarvesterMemory);

        this.memory.harvesterPIDs[sourceIDs[i]] = pid;
      }
    }

    if (!this.memory.refillerPID ||
      !this.kernel.getProcessByPID(this.memory.refillerPID)) {
      const pid = this.kernel.startProcess(CPKG_ControlledRoomRefiller, {
        roomID: this.memory.roomID,
        targetRoom: this.memory.roomID,
        lastTime: Game.time
      } as ControlledRoomRefiller_Memory);

      this.memory.refillerPID = pid;
    }

    for (let i = 0; i < this.memory.workerPIDs.length; i++) {
      if (!this.kernel.getProcessByPID(this.memory.workerPIDs[i])) {
        this.memory.workerPIDs.splice(i--, 1);
      }
    }

    let numWorkers = sourceIDs.length;
    if (room.controller) {
      if (room.controller.level == 1) {
        numWorkers *= 4;
      } else if (room.controller.level == 2) {
        numWorkers *= 4;
      } else if (room.controller.level == 3) {
        numWorkers *= 4;
      } else if (room.controller.level >= 4) {
        numWorkers += 1;
      }
      if (room.controller.level <= 5 && roomData.cSites.length == 0) {
        numWorkers *= 2;
      }
    }

    while (this.memory.workerPIDs.length < numWorkers) {
      this.memory.workerPIDs.push(this.kernel.startProcess(CPKG_Worker, {
        roomID: this.memory.roomID,
        targetRoom: this.memory.roomID,
        expires: true
      } as Worker_Memory))
    }

    if (roomData.mineralIDs.length > 0 && roomData.structures[STRUCTURE_EXTRACTOR].length > 0 &&
      (!this.memory.mineralHarvesterPID || !this.kernel.getProcessByPID(this.memory.mineralHarvesterPID))) {
      const extractor = Game.getObjectById<StructureExtractor>(roomData.structures[STRUCTURE_EXTRACTOR][0]);
      if (extractor) {
        const pid = this.kernel.startProcess(CPKG_MineralHarvester, {
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