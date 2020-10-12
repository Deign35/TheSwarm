export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Scout, Scout);
  }
}
import { SoloCreep } from "./SoloCreep";

class Scout extends SoloCreep<Scout_Memory, SoloCreep_Cache> {
  protected RequestBoost(creep: Creep): boolean {
    return false;
  }
  protected GetNewSpawnID(): string {
    return this.spawnManager.requestSpawn({
      body: [MOVE],
      creepName: this.memory.homeRoom + "_" + (Game.time + '_Sc').slice(-6),
      owner_pid: this.pid
    }, this.memory.homeRoom, Priority_Lowest, {
        parentPID: this.pid
      }, 0);
  }
  protected CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined {
    if (creep.room.name != this.memory.targetRoom) {
      return this.MoveToRoom(creep, this.memory.targetRoom);
    }
    let movePosition = new RoomPosition(25, 25, creep.room.name);
    if (creep.room.name == this.memory.targetRoom) {
      if (creep.room.controller && (!creep.room.controller.sign ||
        creep.room.controller.sign.text != MY_SIGNATURE)) {
        return {
          action: AT_SignController,
          message: MY_SIGNATURE,
          targetID: creep.room.controller.id
        }
      }
      let targetRoom: RoomID | undefined = creep.room.name;
      do {
        const exits = Game.map.describeExits(creep.room.name);
        switch (Math.floor(Math.random() * 4)) {
          case (0): {
            targetRoom = exits[FIND_EXIT_TOP];
            movePosition = creep.pos.findClosestByRange(FIND_EXIT_TOP)!;
            break;
          }
          case (1): {
            targetRoom = exits[FIND_EXIT_RIGHT];
            movePosition = creep.pos.findClosestByRange(FIND_EXIT_RIGHT)!;
            break;
          }
          case (2): {
            targetRoom = exits[FIND_EXIT_BOTTOM];
            movePosition = creep.pos.findClosestByRange(FIND_EXIT_BOTTOM)!;
            break;
          }
          case (3): {
            targetRoom = exits[FIND_EXIT_LEFT];
            movePosition = creep.pos.findClosestByRange(FIND_EXIT_LEFT)!;
            break;
          }
          default:
            break;
        }
      } while (!targetRoom || creep.room.findExitTo(targetRoom) < 0);

      this.memory.targetRoom = targetRoom;
    }

    return {
      action: AT_MoveToPosition,
      distance: 0,
      pos: movePosition,
    }
  }

  HandleNoActivity(creep: Creep) { }
}