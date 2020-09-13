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

class EnergyManager extends BasicProcess<EnergyManager_Memory, MemCache> {
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  protected get logID(): string {
    return RPKG_EnergyManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return RPKG_EnergyManager_LogContext.logLevel;
  }

  RunThread(): ThreadState {
    const roomData = this.roomManager.GetRoomData(this.memory.homeRoom)!;
    const sourceIDs = roomData.sourceIDs;
    for (let i = 0; i < sourceIDs.length; i++) {
      if (!this.memory.harvesterPIDs[sourceIDs[i]] ||
        !this.kernel.getProcessByPID(this.memory.harvesterPIDs[sourceIDs[i]])) {
        const pid = this.kernel.startProcess(CPKG_Harvester, {
          homeRoom: this.memory.homeRoom,
          source: sourceIDs[i],
          targetRoom: this.memory.homeRoom,
        } as HarvesterMemory);

        this.memory.harvesterPIDs[sourceIDs[i]] = pid;
        this.kernel.setParent(pid, this.pid);
      }
    }

    if (!this.memory.refillerPID ||
      !this.kernel.getProcessByPID(this.memory.refillerPID)) {
      const pid = this.kernel.startProcess(CPKG_ControlledRoomRefiller, {
        homeRoom: this.memory.homeRoom,
        targetRoom: this.memory.homeRoom,
        lastTime: Game.time
      } as ControlledRoomRefiller_Memory);

      this.memory.refillerPID = pid;
      this.kernel.setParent(pid, this.pid);
    }

    for (let i = 0; i < this.memory.workerPIDs.length; i++) {
      if (!this.kernel.getProcessByPID(this.memory.workerPIDs[i])) {
        this.memory.workerPIDs.splice(i--, 1);
      }
    }

    let numWorkers = roomData.sourceIDs.length;
    const room = Game.rooms[this.memory.homeRoom];
    if (room.controller!.level <= 3) {
      numWorkers *= 5;
    } else if (!room.storage) {
      numWorkers *= 3;
    } else {
      let storageAmount = Math.floor(room.storage.store[RESOURCE_ENERGY] / 100000);
      if (room.controller!.level >= 6) {
        storageAmount = Math.floor(storageAmount / 2);
      }
      numWorkers += storageAmount;
    }

    while (this.memory.workerPIDs.length < numWorkers) {
      this.memory.workerPIDs.push(this.kernel.startProcess(CPKG_Worker, {
        homeRoom: this.memory.homeRoom,
        targetRoom: this.memory.homeRoom,
        expires: true
      } as Worker_Memory))
      this.kernel.setParent(this.memory.workerPIDs[this.memory.workerPIDs.length - 1], this.pid);
    }

    if (roomData.mineralIDs.length > 0 && roomData.structures[STRUCTURE_EXTRACTOR].length > 0 &&
      (!this.memory.mineralHarvesterPID || !this.kernel.getProcessByPID(this.memory.mineralHarvesterPID))) {
      const extractor = Game.getObjectById<StructureExtractor>(roomData.structures[STRUCTURE_EXTRACTOR][0]);
      if (extractor) {
        const pid = this.kernel.startProcess(CPKG_MineralHarvester, {
          roomID: this.memory.homeRoom,
          squad: [{}, {}],
          targetRoom: this.memory.homeRoom,
        } as MineralHarvester_Memory);
        this.memory.mineralHarvesterPID = pid;
        this.kernel.setParent(pid, this.pid);
      }
    }

    return ThreadState_Done;
  }
}