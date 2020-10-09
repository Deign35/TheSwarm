export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_RoomPlanner, RoomPlanner);
  }
}
import { BasicProcess } from "Core/BasicTypes";
import { OperateOnNeighbors } from "Tools/RoomAlgorithms";

class RoomPlanner extends BasicProcess<RoomPlanner_Memory, MemCache> {
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  RunThread(): ThreadState {
    if (!Game.rooms[this.memory.homeRoom]) { return ThreadState_Done; }
    const room = Game.rooms[this.memory.homeRoom];
    if (!room.controller || !room.controller.my) { return ThreadState_Done; }
    const roomData = this.roomManager.GetRoomData(this.memory.homeRoom)!;
    if (roomData.bunkerAnchor.x < 0 || roomData.bunkerAnchor.y < 0) { return ThreadState_Done; }

    const adjX = 25 - roomData.bunkerAnchor.x;
    const adjY = 25 - roomData.bunkerAnchor.y;
    let hasCreatedSites = false;
    for (let structType in Bunker) {
      if (structType === STRUCTURE_ROAD && room.controller.level < 3) { continue; }
      const numAllowed = CONTROLLER_STRUCTURES[structType][room.controller.level];
      const numTotal = Math.min(numAllowed, Bunker[structType].length);
      for (let i = 0; i < numTotal; i++) {
        if (room.createConstructionSite(Bunker[structType][i].x - adjX, Bunker[structType][i].y - adjY, structType as BuildableStructureConstant) == OK) {
          hasCreatedSites = true;
        }
      }
    }

    if (hasCreatedSites) { return ThreadState_Done; }

    const sources = room.find(FIND_SOURCES);
    const costMatrix = new PathFinder.CostMatrix();
    const sites = room.find(FIND_MY_CONSTRUCTION_SITES);
    const numLinksAllowed = CONTROLLER_STRUCTURES[STRUCTURE_LINK][room.controller.level];
    let currentNum = roomData.structures[STRUCTURE_LINK].length;
    for (let i = 0; i < sites.length; i++) {
      if (sites[i].structureType == STRUCTURE_ROAD) {
        costMatrix.set(sites[i].pos.x, sites[i].pos.y, 1);
      }
      if (sites[i].structureType == STRUCTURE_LINK) {
        currentNum++;
      }
    }

    let numberOfSites = Object.keys(Game.constructionSites).length;
    for (let i = 0; i < sources.length; i++) {
      numberOfSites += this.CreatePathToPosition(sources[i].pos, true, numberOfSites, room.controller.level >= 3, costMatrix);
    }

    numberOfSites += this.CreatePathToPosition(room.controller.pos, false, numberOfSites, room.controller.level >= 3, costMatrix);
    if (room.controller.level >= 6) {
      for (let i = 0; i < roomData.mineralIDs.length; i++) {
        const mineral = Game.getObjectById<Mineral>(roomData.mineralIDs[i]);
        if (mineral) {
          numberOfSites += this.CreatePathToPosition(mineral.pos, true, numberOfSites, room.controller.level >= 3, costMatrix);
          room.createConstructionSite(mineral.pos.x, mineral.pos.y, STRUCTURE_EXTRACTOR);
        }
      }
    }

    for (let i = 0; i < sources.length; i++) {
      if (currentNum >= numLinksAllowed) { break; }
      for (let j = 0; j < roomData.structures[STRUCTURE_CONTAINER].length; j++) {
        const container = Game.getObjectById<StructureContainer>(roomData.structures[STRUCTURE_CONTAINER][j]);
        if (!container) { continue; }

        if (sources[i].pos.isNearTo(container)) {
          const nearbyStructures = room.lookForAtArea(LOOK_STRUCTURES, container.pos.y - 1, container.pos.x - 1, container.pos.y + 1, container.pos.x + 1, true);
          let hasLinkAlready = false;
          for (let k = 0; k < nearbyStructures.length; k++) {
            if (nearbyStructures[k].structure.structureType == STRUCTURE_LINK) {
              hasLinkAlready = true;
              break;
            }
          }

          if (hasLinkAlready) { break; }
          const nearbySites = room.lookForAtArea(LOOK_CONSTRUCTION_SITES, container.pos.y - 1, container.pos.x - 1, container.pos.y + 1, container.pos.x + 1, true);
          for (let k = 0; k < nearbySites.length; k++) {
            if (nearbySites[k].constructionSite.structureType == STRUCTURE_LINK) {
              hasLinkAlready = true;
              break;
            }
          }

          if (hasLinkAlready) { break; }
          let hasFoundLinkPos = false;
          OperateOnNeighbors(container.pos.x, container.pos.y, (x, y) => {
            if (hasFoundLinkPos) { return; }
            const look = room.lookAt(x, y);
            for (let k = 0; k < look.length; k++) {
              if (look[k].type == LOOK_TERRAIN) {
                if (look[k].terrain == "wall") { return; }
              }
              if (look[k].type == LOOK_CONSTRUCTION_SITES || look[k].type == LOOK_STRUCTURES) { return; }

            }

            // If we make it here, it means this is a good spot for a link
            currentNum++;
            room.createConstructionSite(x, y, STRUCTURE_LINK);
            hasFoundLinkPos = true;
          });
          break;
        }
      }
    }

    this.sleeper.sleep(this.pid, 503);
    return ThreadState_Done;
  }

  CreatePathToPosition(pos: RoomPosition, createContainer: boolean, numberOfSites: number, buildRoad: boolean, costMatrix: CostMatrix) {
    const roomData = this.roomManager.GetRoomData(pos.roomName)!;
    const path = pos.findPathTo(roomData.bunkerAnchor.x, roomData.bunkerAnchor.y, {
      costCallback: function (roomName: string) { return costMatrix; },
      ignoreCreeps: true,
      ignoreDestructibleStructures: true,
      ignoreRoads: false,
      swampCost: 5,
      plainCost: 5,
      range: 7
    });
    if (numberOfSites + path.length > 100) {
      return 0;
    }

    const room = Game.rooms[this.memory.homeRoom];
    let numSitesCreated = 0;
    if (path.length > 0 && createContainer) {
      room.createConstructionSite(path[0].x, path[0].y, STRUCTURE_CONTAINER);
      numSitesCreated++;
    }
    if (buildRoad) {
      for (let i = createContainer ? 1 : 0; i < path.length; i++) {
        room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
        numSitesCreated++;
      }
    }

    return numSitesCreated;
  }
}

// https://tinyurl.com/yxrs5dkb
const Bunker: { [id: string]: { x: number, y: number }[] } = {
  [STRUCTURE_TOWER]: [
    { x: 25, y: 22 }, { x: 24, y: 23 }, { x: 22, y: 25 }, { x: 28, y: 25 }, { x: 27, y: 26 }, { x: 25, y: 28 }
  ],
  [STRUCTURE_SPAWN]: [
    { x: 29, y: 25 }, { x: 25, y: 21 }, { x: 25, y: 29 }
  ],
  [STRUCTURE_EXTENSION]: [
    { x: 23, y: 19 }, { x: 25, y: 19 }, { x: 27, y: 19 }, { x: 24, y: 20 }, { x: 26, y: 20 }, // Top

    { x: 28, y: 20 }, { x: 29, y: 20 }, { x: 29, y: 21 }, { x: 30, y: 21 }, { x: 30, y: 22 }, // Outer Top Right
    { x: 27, y: 21 }, { x: 27, y: 22 }, { x: 28, y: 22 }, { x: 28, y: 23 }, { x: 29, y: 23 }, // Inner Top Right

    { x: 31, y: 23 }, { x: 30, y: 24 }, { x: 31, y: 25 }, { x: 30, y: 26 }, { x: 31, y: 27 }, // Right

    { x: 30, y: 28 }, { x: 30, y: 29 }, { x: 29, y: 29 }, { x: 29, y: 30 }, { x: 28, y: 30 }, // Outer Bottom Right
    { x: 29, y: 27 }, { x: 28, y: 27 }, { x: 28, y: 28 }, { x: 27, y: 28 }, { x: 27, y: 29 }, // Inner Bottom Right

    { x: 23, y: 31 }, { x: 24, y: 30 }, { x: 25, y: 31 }, { x: 26, y: 30 }, { x: 27, y: 31 }, // Bottom

    { x: 20, y: 28 }, { x: 20, y: 29 }, { x: 21, y: 29 }, { x: 21, y: 30 }, { x: 22, y: 30 }, // Outer Bottom Left
    { x: 21, y: 27 }, { x: 22, y: 27 }, { x: 22, y: 28 }, { x: 23, y: 28 }, { x: 23, y: 29 }, // Inner Bottom Left

    { x: 19, y: 23 }, { x: 19, y: 25 }, { x: 19, y: 27 }, { x: 20, y: 24 }, { x: 20, y: 26 }, // Left

    { x: 22, y: 20 }, { x: 21, y: 20 }, { x: 21, y: 21 }, { x: 20, y: 21 }, { x: 20, y: 22 }, // Outer Top Left
    { x: 23, y: 21 }, { x: 23, y: 22 }, { x: 22, y: 22 }, { x: 22, y: 23 }, { x: 21, y: 23 }, // Inner Top Left
  ],
  [STRUCTURE_STORAGE]: [{ x: 26, y: 23 }],
  [STRUCTURE_LINK]: [{ x: 21, y: 25 }],
  [STRUCTURE_POWER_SPAWN]: [{ x: 25, y: 23 }],
  [STRUCTURE_TERMINAL]: [{ x: 27, y: 24 }],
  [STRUCTURE_FACTORY]: [{ x: 27, y: 25 }],
  [STRUCTURE_OBSERVER]: [{ x: 26, y: 27 }],
  [STRUCTURE_LAB]: [
    { x: 24, y: 24 }, { x: 25, y: 24 },
    { x: 23, y: 25 }, { x: 24, y: 25 }, { x: 26, y: 25 },
    { x: 23, y: 26 }, { x: 25, y: 26 }, { x: 26, y: 26 },
    { x: 24, y: 27 }, { x: 25, y: 27 },
  ],
  [STRUCTURE_NUKER]: [{ x: 23, y: 24 }],
  [STRUCTURE_ROAD]: [
    { x: 25, y: 20 }, { x: 24, y: 21 }, { x: 26, y: 21 }, { x: 24, y: 22 }, { x: 26, y: 22 },
    { x: 20, y: 25 }, { x: 21, y: 24 }, { x: 21, y: 26 }, { x: 22, y: 24 }, { x: 22, y: 26 },
    { x: 30, y: 25 }, { x: 29, y: 24 }, { x: 29, y: 26 }, { x: 28, y: 24 }, { x: 28, y: 26 },
    { x: 25, y: 30 }, { x: 24, y: 29 }, { x: 26, y: 29 }, { x: 24, y: 28 }, { x: 26, y: 28 },

    { x: 24, y: 26 }, { x: 25, y: 25 }, { x: 26, y: 24 },

    { x: 21, y: 19 }, { x: 22, y: 19 }, { x: 24, y: 19 }, { x: 26, y: 19 }, { x: 28, y: 19 }, { x: 29, y: 19 },
    { x: 20, y: 20 }, { x: 23, y: 20 }, { x: 27, y: 20 }, { x: 30, y: 20 },
    { x: 19, y: 21 }, { x: 22, y: 21 }, { x: 28, y: 21 }, { x: 31, y: 21 },
    { x: 19, y: 22 }, { x: 21, y: 22 }, { x: 29, y: 22 }, { x: 31, y: 22 },
    { x: 20, y: 23 }, { x: 23, y: 23 }, { x: 27, y: 23 }, { x: 30, y: 23 },
    { x: 19, y: 24 }, { x: 31, y: 24 },

    { x: 19, y: 26 }, { x: 31, y: 26 },
    { x: 20, y: 27 }, { x: 23, y: 27 }, { x: 27, y: 27 }, { x: 30, y: 27 },
    { x: 19, y: 28 }, { x: 21, y: 28 }, { x: 29, y: 28 }, { x: 31, y: 28 },
    { x: 19, y: 29 }, { x: 22, y: 29 }, { x: 28, y: 29 }, { x: 31, y: 29 },
    { x: 20, y: 30 }, { x: 23, y: 30 }, { x: 27, y: 30 }, { x: 30, y: 30 },
    { x: 21, y: 31 }, { x: 22, y: 31 }, { x: 24, y: 31 }, { x: 26, y: 31 }, { x: 28, y: 31 }, { x: 29, y: 31 },
  ]
}