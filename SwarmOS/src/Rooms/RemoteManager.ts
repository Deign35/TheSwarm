export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_RemoteManager, RemoteManager);
  }
}
import { BasicProcess } from "Core/BasicTypes";

class RemoteManager extends BasicProcess<RemoteManager_Memory> {
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  RunThread(): ThreadState {
    const room = Game.rooms[this.memory.targetRoom];
    const homeRoom = Game.rooms[this.memory.homeRoom];
    const roomData = this.roomManager.GetRoomData(this.memory.targetRoom);
    if (!this.memory.invasion && Game.rooms[this.memory.targetRoom] && Game.time % 5 == 0) {
      const invaders = Game.rooms[this.memory.targetRoom].find(FIND_HOSTILE_CREEPS);
      for (let i = 0; i < invaders.length; i++) {
        if (invaders[i].owner.username == "Invader") {
          this.log.alert(`Invasion detected: ${this.memory.targetRoom}`);
          this.memory.invasion = invaders[i].ticksToLive!;
        }
      }
    }

    if (this.memory.invasion) {
      this.memory.invasion--;
      if (this.memory.invasion <= 0) {
        delete this.memory.invasion;
      }
      const vis = new RoomVisual(this.memory.targetRoom);
      let pos = new RoomPosition(25, 25, this.memory.targetRoom);
      if (room && room.controller) {
        pos = room.controller.pos;
      }

      vis.text(`${this.memory.invasion}`, pos.x, pos.y);
      return ThreadState_Done;
    }
    return ThreadState_Done;
  }
}