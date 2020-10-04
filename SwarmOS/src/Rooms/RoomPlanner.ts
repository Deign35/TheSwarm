export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_RoomPlanner, RoomPlanner);
  }
}
import { BasicProcess } from "Core/BasicTypes";

class RoomPlanner extends BasicProcess<RoomPlanner_Memory, MemCache> {
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  RunThread(): ThreadState {
    if (!this.memory.anchorPosX || !this.memory.anchorPosY) {
      // find a position for the anchor.
      this.memory.anchorPosX = 18;
      this.memory.anchorPosY = 23;
    }

    if (!Game.rooms[this.memory.homeRoom]) { return ThreadState_Done; }

    const room = Game.rooms[this.memory.homeRoom];
    if (!room.controller || !room.controller.my) { return ThreadState_Done; }
    const adjX = 25 - this.memory.anchorPosX;
    const adjY = 25 - this.memory.anchorPosY;
    for (let structType in Flower) {
      const numAllowed = CONTROLLER_STRUCTURES[structType][room.controller.level];
      const numTotal = Math.min(numAllowed, Flower[structType].length);
      for (let i = 0; i < numTotal; i++) {
        room.createConstructionSite(Flower[structType][i].x - adjX, Flower[structType][i].y - adjY, structType as BuildableStructureConstant);
      }
    }
    //this.sleeper.sleep(this.pid, 503);
    return ThreadState_Done;
  }
}

const Flower: { [id: string]: {x: number, y: number}[] } = {
  [STRUCTURE_EXTENSION]: [
    { x: 19, y: 19 }, { x: 20, y: 19 }, { x: 21, y: 19 }, { x: 29, y: 19 }, { x: 30, y: 19 }, { x: 31, y: 19 },
    { x: 19, y: 20 }, { x: 21, y: 20 }, { x: 22, y: 20 }, { x: 28, y: 20 }, { x: 29, y: 20 }, { x: 31, y: 20 },
    { x: 19, y: 21 }, { x: 20, y: 21 }, { x: 22, y: 21 }, { x: 23, y: 21 }, { x: 27, y: 21 }, { x: 28, y: 21 }, { x: 30, y: 21 }, { x: 31, y: 21 },
    { x: 20, y: 22 }, { x: 21, y: 22 }, { x: 23, y: 22 }, { x: 27, y: 22 }, { x: 29, y: 22 }, { x: 30, y: 22 },
    { x: 21, y: 23 }, { x: 22, y: 23 }, { x: 28, y: 23 }, { x: 29, y: 23 },
    
    { x: 19, y: 31 }, { x: 20, y: 31 }, { x: 21, y: 31 }, { x: 29, y: 31 }, { x: 30, y: 31 }, { x: 31, y: 31 },
    { x: 19, y: 30 }, { x: 21, y: 30 }, { x: 22, y: 30 }, { x: 28, y: 30 }, { x: 29, y: 30 }, { x: 31, y: 30 },
    { x: 19, y: 29 }, { x: 20, y: 29 }, { x: 22, y: 29 }, { x: 23, y: 29 }, { x: 27, y: 29 }, { x: 28, y: 29 }, { x: 30, y: 29 }, { x: 31, y: 29 },
    { x: 20, y: 28 }, { x: 21, y: 28 }, { x: 23, y: 28 }, { x: 27, y: 28 }, { x: 29, y: 28 }, { x: 30, y: 28 },
    { x: 21, y: 27 }, { x: 22, y: 27 }, { x: 28, y: 27 }, { x: 29, y: 27 },
  ],
  [STRUCTURE_LAB]: [
    { x: 24, y: 24 }, { x: 25, y: 24 },
    { x: 23, y: 25 }, { x: 24, y: 25 }, { x: 26, y: 25 },
    { x: 23, y: 26 }, { x: 25, y: 26 }, { x: 26, y: 26 },
    { x: 24, y: 27 }, { x: 25, y: 27 },
  ],
  [STRUCTURE_STORAGE]: [ { x: 23, y: 24 }],
  [STRUCTURE_LINK]: [ { x: 21, y: 25 }],
  [STRUCTURE_SPAWN]: [
    { x: 25, y: 21 }, { x: 29, y: 25 }, { x: 25, y: 29 }
  ],
  [STRUCTURE_TOWER]: [
    { x: 25, y: 22 }, { x: 24, y: 23 }, { x: 22, y: 25 }, { x: 28, y: 25 }, { x: 27, y: 26 }, { x: 25, y: 28 }
  ],
  [STRUCTURE_POWER_SPAWN]: [ { x: 25, y: 23 }],
  [STRUCTURE_TERMINAL]: [ { x: 26, y: 27 }],
  [STRUCTURE_FACTORY]: [ { x: 27, y: 25 }],
  [STRUCTURE_OBSERVER]: [ { x: 27, y: 24 }],
  [STRUCTURE_NUKER]: [ { x: 26, y: 23 }],
  [STRUCTURE_ROAD]: [
    { x: 20, y: 20 }, { x: 21, y: 21 }, { x: 22, y: 22 }, { x: 23, y: 23 },
    { x: 30, y: 20 }, { x: 29, y: 21 }, { x: 28, y: 22 }, { x: 27, y: 23 },
    { x: 20, y: 30 }, { x: 21, y: 29 }, { x: 22, y: 28 }, { x: 23, y: 27 },
    { x: 30, y: 30 }, { x: 29, y: 29 }, { x: 28, y: 28 }, { x: 27, y: 27 },

    { x: 25, y: 20 }, { x: 24, y: 21 }, { x: 26, y: 21 }, { x: 24, y: 22 }, { x: 26, y: 22 },
    { x: 20, y: 25 }, { x: 21, y: 24 }, { x: 21, y: 26 }, { x: 22, y: 24 }, { x: 22, y: 26 },
    { x: 30, y: 25 }, { x: 29, y: 24 }, { x: 29, y: 26 }, { x: 28, y: 24 }, { x: 28, y: 26 },
    { x: 25, y: 30 }, { x: 24, y: 29 }, { x: 26, y: 29 }, { x: 24, y: 28 }, { x: 26, y: 28 },

    { x: 24, y: 26 }, {x: 25, y: 25 }, {x: 26, y: 24 }
  ]
}