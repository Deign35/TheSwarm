declare var Memory: {
  roomData: RoomStateMemory
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

class RoomManager extends BasicProcess<RoomStateMemory> {
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
      let data = this.roomManager.GetRoomData(roomID);
      if (!data) {
        continue;
      }

      if (Game.time - data.lastUpdated > 17) {
        this.roomManager.ScanRoom(roomID);
      }

      if (!data.activityPID || !this.kernel.getProcessByPID(data.activityPID)) {
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
      let room = Game.rooms[roomID];
      if (room) {
        this.memory.roomStateData[roomID] = {
          lastUpdated: 0,
          activityPID: '',
          mineralIDs: room.find(FIND_MINERALS)!.map((val: Mineral) => {
            return val.id;
          }),
          sourceIDs: room.find(FIND_SOURCES)!.map((val: Source) => {
            return val.id;
          }),
          cSites: [],
          needsRepair: []
        }
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
    let cSites = Game.rooms[roomID].find(FIND_CONSTRUCTION_SITES);
    for (let i = 0; i < cSites.length; i++) {
      roomState.cSites.push(cSites[i].id);
    }

    roomState.needsRepair = [];
    let structures = Game.rooms[roomID].find(FIND_STRUCTURES);
    for (let i = 0; i < structures.length; i++) {
      if (structures[i].hits < structures[i].hitsMax * 0.75) {
        roomState.needsRepair.push(structures[i].id);
      }
    }

    roomState.lastUpdated = Game.time;
  }
}