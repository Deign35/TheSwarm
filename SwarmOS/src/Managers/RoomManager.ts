declare var Memory: {
  roomData: RoomStateMemory;
}

import { ExtensionBase, BasicProcess } from "Core/BasicTypes";
import { GenerateWallDistanceMatrix, GetDistancePeaks, GenerateDistanceMatrix } from "Tools/RoomAlgorithms";

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_RoomManager, RoomManager);
    extensionRegistry.register(EXT_RoomManager, new RoomManagerExtension(extensionRegistry));
  }
}

const PKG_RoomManager_LogContext: LogContext = {
  logID: PKG_RoomManager,
  logLevel: LOG_INFO
}

class RoomManager extends BasicProcess<RoomStateMemory, MemCache> {
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;

  get memory(): RoomStateMemory {
    if (!Memory.roomData) {
      this.log.warn(`Initializing RoomManager memory`);
      Memory.roomData = {
        roomStateData: {},
      }
    }
    return Memory.roomData;
  }
  protected get logID(): string {
    return PKG_RoomManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_RoomManager_LogContext.logLevel;
  }

  RunThread(): ThreadState {
    for (let roomID in Game.rooms) {
      const data = this.roomManager.GetRoomData(roomID)!;
      if (!data) {
        continue;
      }
      if (Game.time - data.lastUpdated > 23) {
        this.roomManager.ScanRoom(roomID);
      }

      if (!data.activityPID || !this.kernel.getProcessByPID(data.activityPID!)) {
        data.activityPID = this.kernel.startProcess(RPKG_RoomController, {
          homeRoom: roomID,
          activityPIDs: {}
        } as RoomController_Memory);
        this.kernel.setParent(data.activityPID!, this.pid);
      }

      const room = Game.rooms[roomID];
      if (room && room.controller && room.controller.my) {
        const vis: RoomVisual = new RoomVisual(roomID);

        const headerStyle: TextStyle = { align: 'left', color: 'white', backgroundColor: 'black', opacity: 0.7 };
        vis.text(`Energy: ${room.energyAvailable}/${room.energyCapacityAvailable}`, 0, 2, headerStyle);
      }
    }

    return ThreadState_Done;
  }
}

class RoomManagerExtension extends ExtensionBase implements IRoomManagerExtension {
  get memory(): RoomStateMemory {
    if (!Memory.roomData) {
      this.log.warn(`Initializing RoomManager memory`);
      Memory.roomData = {
        roomStateData: {}
      }
    }

    return Memory.roomData;
  }
  protected get logID(): string {
    return PKG_RoomManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_RoomManager_LogContext.logLevel;
  }

  GetRoomData(roomID: string): RoomState {
    let roomState = this.memory.roomStateData[roomID];
    if (!roomState) {
      const room = Game.rooms[roomID];
      if (room) {
        roomState = {
          roomType: RT_Nuetral,
          wallStrength: 0,
          rampartStrength: 0,
          lastUpdated: 0,
          labOrders: {},
          labRequests: [],
          terminalRequests: [],
          mineralIDs: room.find(FIND_MINERALS)!.map((val: Mineral) => {
            return val.id;
          }),
          sourceIDs: room.find(FIND_SOURCES)!.map((val: Source) => {
            return val.id;
          }),
          cSites: [],
          needsRepair: [],
          structures: {
            container: [],
            extension: [],
            extractor: [],
            lab: [],
            link: [],
            spawn: [],
            terminal: [],
            tower: []
          },
          resources: [],
          tombstones: [],
          ruins: [],
          boostAssignments: {},
          bunkerAnchor: { x: -1, y: -1 }
        }

        const terrain = new Room.Terrain(roomID);
        const wallDist = GenerateWallDistanceMatrix(terrain, true);
        const spawns = room.find(FIND_MY_SPAWNS);
        if (spawns.length > 0) {
          // Already plopped down a spawn.
          roomState.bunkerAnchor.x = spawns[0].pos.x - 4;
          roomState.bunkerAnchor.y = spawns[0].pos.y;
          if (wallDist[roomState.bunkerAnchor.x * 50 + roomState.bunkerAnchor.y] < 7) {
            roomState.bunkerAnchor = { x: -1, y: -1 }
          }
        } else {
          // find a position for the anchor.
          const peaks = GetDistancePeaks(wallDist);
          const distanceMatrices: number[][] = [];
          if (room.controller) {
            distanceMatrices.push(GenerateDistanceMatrix(terrain, room.controller.pos));
          }
          const sources = room.find(FIND_SOURCES);
          for (let i = 0; i < sources.length; i++) {
            distanceMatrices.push(GenerateDistanceMatrix(terrain, sources[i].pos));
          }
          const minerals = room.find(FIND_MINERALS);
          for (let i = 0; i < minerals.length; i++) {
            distanceMatrices.push(GenerateDistanceMatrix(terrain, minerals[i].pos));
          }

          const combinedDistanceMatrix = new Array(2500).fill(0);
          for (let i = 0; i < 2500; i++) {
            for (let j = 0; j < distanceMatrices.length; j++) {
              combinedDistanceMatrix[i] += distanceMatrices[j][i];
            }
          }

          let lowestValley = Infinity;
          let peakIndex = -1;
          for (let i = 0; i < peaks.length; i++) {
            if (wallDist[peaks[i]] >= 7) {
              if (combinedDistanceMatrix[peaks[i]] < lowestValley) {
                lowestValley = combinedDistanceMatrix[peaks[i]];
                peakIndex = peaks[i];
              }
            }
          }

          if (peakIndex < 0) {
            roomState.bunkerAnchor = { x: -1, y: -1 }
          } else {
            roomState.bunkerAnchor.x = Math.floor(peakIndex / 50);
            roomState.bunkerAnchor.y = peakIndex % 50;
          }
        }

        if (roomState.bunkerAnchor.x >= 0 && roomState.bunkerAnchor.y >= 0) {
          room.createFlag(roomState.bunkerAnchor.x + 4, roomState.bunkerAnchor.y);
        }
        this.memory.roomStateData[roomID] = roomState;
      }
    }

    return roomState;
  }

  ScanRoom(roomID: string) {
    let roomState = this.GetRoomData(roomID);
    if (!roomState || !Game.rooms[roomID]) {
      return;
    }

    roomState.cSites = [];
    const cSites = Game.rooms[roomID].find(FIND_CONSTRUCTION_SITES);
    for (let i = 0; i < cSites.length; i++) {
      roomState.cSites.push(cSites[i].id);
    }

    roomState.needsRepair = [];
    const structures = Game.rooms[roomID].find(FIND_STRUCTURES);

    roomState.structures = {
      container: [],
      extension: [],
      extractor: [],
      lab: [],
      link: [],
      spawn: [],
      terminal: [],
      tower: []
    }

    const structureTypeIDs = Object.keys(roomState.structures);
    for (let i = 0; i < structures.length; i++) {
      if ((structures[i].hits < structures[i].hitsMax * 0.75) &&
        structures[i].structureType != STRUCTURE_WALL &&
        structures[i].structureType != STRUCTURE_RAMPART) {
        roomState.needsRepair.push(structures[i].id);
      }

      if (structures[i].structureType == STRUCTURE_WALL) {
        if (structures[i].hits < (roomState.wallStrength || 0)) {
          roomState.needsRepair.push(structures[i].id);
        }
      }

      if (structures[i].structureType == STRUCTURE_RAMPART) {
        if (structures[i].hits < (roomState.rampartStrength || 0)) {
          roomState.needsRepair.push(structures[i].id);
        }
      }

      for (let j = 0; j < structureTypeIDs.length; j++) {
        if (!roomState.structures[structureTypeIDs[j]]) {
          roomState.structures[structureTypeIDs[j]] = [];
        }
        if (structures[i].structureType == structureTypeIDs[j]) {
          roomState.structures[structureTypeIDs[j]]!.push(structures[i].id);
        }
      }
    }

    roomState.resources = [];
    const resources = Game.rooms[roomID].find(FIND_DROPPED_RESOURCES);
    for (let i = 0; i < resources.length; i++) {
      roomState.resources.push(resources[i].id);
    }

    roomState.tombstones = [];
    const tombstones = Game.rooms[roomID].find(FIND_TOMBSTONES);
    for (let i = 0; i < tombstones.length; i++) {
      roomState.tombstones.push(tombstones[i].id);
    }

    roomState.ruins = [];
    const ruins = Game.rooms[roomID].find(FIND_RUINS);
    for (let i = 0; i < ruins.length; i++) {
      roomState.ruins.push(ruins[i].id);
    }

    roomState.lastUpdated = Game.time;
  }
}