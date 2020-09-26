declare var Memory: {
  roomData: RoomStateMemory;
}

import { ExtensionBase, BasicProcess } from "Core/BasicTypes";

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
            spawn: [],
            storage: [],
            terminal: [],
            tower: []
          },
          resources: [],
          tombstones: [],
          ruins: [],
          boostAssignments: {}
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
      spawn: [],
      storage: [],
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