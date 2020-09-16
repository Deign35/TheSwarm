export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_WallWatcher, WallWatcher);
  }
}
import { BasicProcess } from "Core/BasicTypes";

class WallWatcher extends BasicProcess<WallWatcher_Memory, WallWatcher_Cache> {
  @extensionInterface(EXT_CreepManager)
  creepManager!: ICreepManagerExtensions;
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  RunThread(): ThreadState {
    const room = Game.rooms[this.memory.homeRoom];
    if (!room) { return ThreadState_Done; }

    const structures = room.find(FIND_STRUCTURES);
    let wallCount = 0;
    let rampartCount = 0;
    for (let i = 0; i < structures.length; i++) {
      if (structures[i].structureType == STRUCTURE_WALL) {
        wallCount++;
      } else if (structures[i].structureType == STRUCTURE_RAMPART) {
        rampartCount++;
      }
    }

    if (this.cache.rampartCount && this.cache.wallCount) {
      if (this.cache.rampartCount > rampartCount || this.cache.wallCount > wallCount) {
        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 3) {
          room.controller!.activateSafeMode();
        } else {
          for (let i = 0; i < hostiles.length; i++) {
            const creepData = this.creepManager.EvaluateCreep(hostiles[i]);
            if (creepData.effectiveHitPoints > 5000) {
              room.controller!.activateSafeMode();
            }
          }
        }
      }
    }

    this.cache.rampartCount = rampartCount;
    this.cache.wallCount = wallCount;
    this.sleeper.sleep(this.pid, 15);

    return ThreadState_Done;
  }
}