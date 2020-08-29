export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Worker, Scout);
  }
}
import { SoloJob } from "./SoloJob";

class Scout extends SoloJob<Scout_Memory> {
  PrepTick() {
    let creep = Game.creeps[this.memory.creepID!];
    if (!creep || creep.room.name != this.memory.targetRoom) {
      return;
    }
    let targetRoom: RoomID | undefined = creep.room.name;
    do {
      let exits = Game.map.describeExits(creep.room.name);
      switch(Math.floor(Math.random() * 4)) {
        case (0): {
          targetRoom = exits[FIND_EXIT_TOP];
          break;
        }
        case (1): {
          targetRoom = exits[FIND_EXIT_RIGHT];
          break;
        }
        case (2): {
          targetRoom = exits[FIND_EXIT_BOTTOM];
          break;
        }
        case(3): {
          targetRoom = exits[FIND_EXIT_LEFT];
          break;
        }
        default:
          break;
      }
    } while (targetRoom && creep.room.findExitTo(targetRoom) > 0);

    this.memory.targetRoom = targetRoom!;
  }

  protected GetNewSpawnID(): string {
    return this.spawnManager.requestSpawn({
      body: [TOUGH, TOUGH, MOVE, MOVE],
      creepName: this.memory.roomID + (Game.time + '_Sc').slice(-6),
      owner_pid: this.pid
    }, this.memory.roomID, Priority_Lowest, {
        parentPID: this.pid
      }, 3);
  }
  protected CreateCustomCreepActivity(creep: Creep): string | undefined {
    return undefined;
  }

  HandleNoActivity() { }
}