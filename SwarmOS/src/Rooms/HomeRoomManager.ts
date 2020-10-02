export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_HomeRoomManager, HomeRoomManager);
  }
}
import { BasicProcess } from "Core/BasicTypes";

const RPKG_EnergyManager_LogContext: LogContext = {
  logID: RPKG_HomeRoomManager,
  logLevel: LOG_TRACE
}

class HomeRoomManager extends BasicProcess<HomeRoomManager_Memory, HomeRoomManager_Cache> {
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
    if (roomData.sourceIDs.length == 1 || Game.rooms[this.memory.homeRoom].energyCapacityAvailable < 2100) {
      const sourceIDs = roomData.sourceIDs;
      for (let i = 0; i < sourceIDs.length; i++) {
        if (!this.memory.harvesterPIDs[sourceIDs[i]] ||
          !this.kernel.getProcessByPID(this.memory.harvesterPIDs[sourceIDs[i]])) {
          const pid = this.kernel.startProcess(CPKG_Harvester, {
            homeRoom: this.memory.homeRoom,
            source: sourceIDs[i],
            targetRoom: this.memory.homeRoom,
            expires: true
          } as HarvesterMemory);

          this.memory.harvesterPIDs[sourceIDs[i]] = pid;
          this.kernel.setParent(pid, this.pid);
        }
      }
    } else {
      if (!this.memory.largeHarvester ||
        !this.kernel.getProcessByPID(this.memory.largeHarvester)) {
          const pid = this.kernel.startProcess(CPKG_LargeHarvester, {
            homeRoom: this.memory.homeRoom,
            targetRoom: this.memory.homeRoom,
            expires: true,
          } as LargeHarvester_Memory);
          this.memory.largeHarvester = pid;
          this.kernel.setParent(pid, this.pid);
        }
    }

    for (let i = 0; i < this.memory.refillerPIDs.length; i++) {
      if (!this.kernel.getProcessByPID(this.memory.refillerPIDs[i])) {
        this.memory.refillerPIDs.splice(i--, 1);
      }
    }

    while (this.memory.refillerPIDs.length < roomData.sourceIDs.length) {
      const pid = this.kernel.startProcess(CPKG_ControlledRoomRefiller, {
        homeRoom: this.memory.homeRoom,
        targetRoom: this.memory.homeRoom,
        expires: true
      } as ControlledRoomRefiller_Memory);

      this.memory.refillerPIDs.push(pid);
      this.kernel.setParent(pid, this.pid);
    }

    for (let i = 0; i < this.memory.workerPIDs.length; i++) {
      if (!this.kernel.getProcessByPID(this.memory.workerPIDs[i])) {
        this.memory.workerPIDs.splice(i--, 1);
      }
    }

    let numWorkers = roomData.sourceIDs.length;
    const room = Game.rooms[this.memory.homeRoom];
    if (room.energyCapacityAvailable <= 550) {
      numWorkers *= 5;
    } else if (room.energyCapacityAvailable <= 800) {
      numWorkers *= 4;
    } else if (!room.storage) {
      numWorkers *= 3;
    } else {
      let storageAmount = Math.ceil(room.storage.store[RESOURCE_ENERGY] / 100000);
      if (room.energyCapacityAvailable >= 2300) {
        storageAmount = Math.floor(storageAmount / 2);
      }
      numWorkers += storageAmount;
    }
    numWorkers -= 1;

    while (this.memory.workerPIDs.length < numWorkers) {
      this.memory.workerPIDs.push(this.kernel.startProcess(CPKG_Worker, {
        homeRoom: this.memory.homeRoom,
        targetRoom: this.memory.homeRoom,
        expires: true
      } as Worker_Memory))
      this.kernel.setParent(this.memory.workerPIDs[this.memory.workerPIDs.length - 1], this.pid);
    }

    if (!this.memory.upgraderPID || !this.kernel.getProcessByPID(this.memory.upgraderPID)) {
      this.memory.upgraderPID = this.kernel.startProcess(CPKG_Upgrader, {
        homeRoom: this.memory.homeRoom,
        targetRoom: this.memory.homeRoom,
        expires: true,
      } as Upgrader_Memory);
    }

    if (roomData.mineralIDs.length > 0 && roomData.structures[STRUCTURE_EXTRACTOR].length > 0) {
      const extractor = Game.getObjectById<StructureExtractor>(roomData.structures[STRUCTURE_EXTRACTOR][0]);
      if (extractor) {
        if (!this.memory.mineralHarvesterPID || !this.kernel.getProcessByPID(this.memory.mineralHarvesterPID)) {
          const pid = this.kernel.startProcess(CPKG_MineralHarvester, {
            homeRoom: this.memory.homeRoom,
            targetRoom: this.memory.homeRoom
          } as MineralHarvester_Memory);
          this.memory.mineralHarvesterPID = pid;
          this.kernel.setParent(pid, this.pid);
        }

        if (!this.memory.mineralCollectorPID || !this.kernel.getProcessByPID(this.memory.mineralCollectorPID)) {
          const pid = this.kernel.startProcess(CPKG_MineralCollector, {
            homeRoom: this.memory.homeRoom,
            targetRoom: this.memory.homeRoom
          } as MineralCollector_Memory);
          this.memory.mineralCollectorPID = pid;
          this.kernel.setParent(pid, this.pid);
        }
      }
    }

    const linkIDs = roomData.structures[STRUCTURE_LINK];
    if (!this.cache.primaryLink) {
      for (let i = 0; i < linkIDs.length; i++) {
        const link = Game.getObjectById<StructureLink>(linkIDs[i]);
        if (!link) { continue; }
        if (link.pos.x == 1 || link.pos.x == 48 || link.pos.y == 1 || link.pos.y == 48) {
          continue;
        }
        const closeSources = link.pos.findInRange(FIND_SOURCES, 2);
        if (closeSources.length > 0) {
          continue;
        }
        this.cache.primaryLink = linkIDs[i];
      }
    }

    if (this.cache.primaryLink) {
      const primaryLink = Game.getObjectById<StructureLink>(this.cache.primaryLink);
      if (!primaryLink) {
        delete this.cache.primaryLink;
      } else {
        for (let i = 0; i < linkIDs.length; i++) {
          if (linkIDs[i] == this.cache.primaryLink) { continue; }
          const link = Game.getObjectById<StructureLink>(linkIDs[i]);
          if (!link) { continue; }
          if (link.cooldown <= 0 && link.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            link.transferEnergy(primaryLink);
          }
        }
      }
    }

    return ThreadState_Done;
  }
}