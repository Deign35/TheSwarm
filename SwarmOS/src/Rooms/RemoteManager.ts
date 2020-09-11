export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_RemoteManager, RemoteManager);
  }
}
import { BasicProcess } from "Core/BasicTypes";

class RemoteManager extends BasicProcess<RemoteManager_Memory, MemCache> {
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  RunThread(): ThreadState {
    const targetRoom = Game.rooms[this.memory.targetRoom];
    if (!this.memory.invasion && targetRoom && Game.time % 11 == 0) {
      const invaders = targetRoom.find(FIND_HOSTILE_CREEPS);
      for (let i = 0; i < invaders.length; i++) {
        if (invaders[i].owner.username == "Invader") {
          this.log.alert(`Invasion detected: ${this.memory.targetRoom}`);
          this.memory.invasion = invaders[i].ticksToLive!;
          if (!this.memory.remoteProtector || !this.kernel.getProcessByPID(this.memory.remoteProtector)) {
            this.memory.remoteProtector = this.kernel.startProcess(BPKG_RemoteProtector, {
              homeRoom: this.memory.homeRoom,
              squad: [{}],
              targetRoom: this.memory.targetRoom
            } as RemoteProtector_Memory);
            this.kernel.setParent(this.memory.remoteProtector, this.pid);
          }
        }
      }
    }

    if (this.memory.invasion) {
      this.memory.invasion--;
      if (targetRoom && Game.time % 11 == 0) {
        const invaders = targetRoom.find(FIND_HOSTILE_CREEPS);
        if (this.memory.invasion <= 0 || invaders.length == 0) {
          delete this.memory.invasion;
        }
      }
      const vis = new RoomVisual(this.memory.targetRoom);
      let pos = new RoomPosition(25, 25, this.memory.targetRoom);
      if (targetRoom && targetRoom.controller) {
        pos = targetRoom.controller.pos;
      }

      vis.text(`${this.memory.invasion}`, pos.x, pos.y);
      return ThreadState_Done;
    }

    if (!this.memory.claimerPID || !this.kernel.getProcessByPID(this.memory.claimerPID)) {
      this.memory.claimerPID = this.kernel.startProcess(CPKG_ControllerClaimer, {
        expires: true,
        homeRoom: this.memory.homeRoom,
        onlyReserve: true,
        targetRoom: this.memory.targetRoom
      } as ControllerClaimer_Memory);
      this.kernel.setParent(this.memory.claimerPID, this.pid);
    }

    if (!this.memory.workerPID || !this.kernel.getProcessByPID(this.memory.workerPID)) {
      this.memory.workerPID = this.kernel.startProcess(CPKG_Worker, {
        expires: true,
        homeRoom: this.memory.homeRoom,
        targetRoom: this.memory.targetRoom
      } as Worker_Memory);
      this.kernel.setParent(this.memory.workerPID, this.pid);
    }

    const sources = this.roomManager.GetRoomData(this.memory.targetRoom)!.sourceIDs;
    for (const id of sources) {
      if (!this.memory.harvesterPIDs[id] || !this.kernel.getProcessByPID(this.memory.harvesterPIDs[id])) {
        this.memory.harvesterPIDs[id] = this.kernel.startProcess(CPKG_Harvester, {
          expires: true,
          homeRoom: this.memory.homeRoom,
          remoteHarvester: true,
          source: id,
          targetRoom: this.memory.targetRoom
        } as HarvesterMemory);
        this.kernel.setParent(this.memory.harvesterPIDs[id], this.pid);
      }
    }

    for (let i = 0; i < this.memory.refillerPIDs.length; i++) {
      if (!this.kernel.getProcessByPID(this.memory.refillerPIDs[i])) {
        this.memory.refillerPIDs.splice(i--, 1);
      }
    }

    while (this.memory.refillerPIDs.length < this.memory.numRefillers) {
      this.memory.refillerPIDs.push(this.kernel.startProcess(CPKG_RemoteRefiller, {
        expires: true,
        homeRoom: this.memory.homeRoom,
        targetRoom: this.memory.targetRoom
      } as RemoteRefiller_Memory));
      this.kernel.setParent(this.memory.refillerPIDs[this.memory.refillerPIDs.length - 1], this.pid);
    }

    this.sleeper.sleep(this.pid, 5);
    return ThreadState_Done;
  }
}