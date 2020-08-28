export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(APKG_MoveToRoomActivity, MoveToRoomActivity);
  }
}

import { BasicProcess } from "Core/BasicTypes";

class MoveToRoomActivity extends BasicProcess<MoveToRoomActivity_Memory> {
  @extensionInterface(EXT_CreepManager)
  protected creepManager!: ICreepManagerExtensions;
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;

  RunThread(): ThreadState {
    let creep = this.creepManager.tryGetCreep(this.memory.creepID, this.parentPID);
    if (!creep || creep.room.name == this.memory.targetRoom) {
      this.EndProcess();
      return ThreadState_Done;
    }

    if (!this.memory.route) {
      const route = Game.map.findRoute(creep.room, this.memory.targetRoom);
      if (route == -2) {
        this.EndProcess();
        return ThreadState_Done;
      }

      this.memory.route = route;
    }

    if(this.memory.route.length > 0) {
      for(let i = 0; i < this.memory.route.length; i++) {
        if (this.memory.moveTarget.roomName != creep.room.name) {
          if (this.memory.route[i].room == creep.room.name) {
            let exit = creep.pos.findClosestByRange(this.memory.route[i].exit)!;
            this.memory.moveTarget = exit;
          }
        }
      }
    }

    if (!this.memory.route || this.memory.route.length == 0 || !this.memory.moveTarget) {
      this.EndProcess();
      return ThreadState_Done;
    }

    creep.moveTo(this.memory.moveTarget);
    return ThreadState_Done;
  }
}