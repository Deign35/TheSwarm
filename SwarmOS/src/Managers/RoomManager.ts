declare var Memory: {
  roomData: RoomStateMemory
}

import { ExtensionBase, BasicProcess } from "Core/BasicTypes";

export const OSPackage: IPackage<RoomStateMemory> = {
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
    return PKG_RoomManager_LogContext.logLevel!;
  }

  @extensionInterface(EXT_RoomManager)
  RoomView!: RoomManagerExtension;
  RunThread(): ThreadState {

    return ThreadState_Done;
  }
}

class RoomManagerExtension extends ExtensionBase {
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
    return PKG_RoomManager_LogContext.logLevel!;
  }

  GetRoomData(roomID: string): RoomState {
    let roomState = this.memory.roomStateData[roomID];
    if (!roomState) {
      let room = Game.rooms[roomID];
      this.memory.roomStateData[roomID] = {
        owner: '',
        lastUpdated: 0,
        lastEnergy: 0,
        cSites: [],
        resources: [],
        tombstones: [],
        needsRepair: [],
        mineralIDs: room.find(FIND_MINERALS)!.map((val: Mineral) => {
            return val.id;
        }),
        minUpdateOffset: GetRandomIndex(primes_1000) || 73,
        sourceIDs: room.find(FIND_SOURCES)!.map((val: Source) => {
            return val.id;
        }),
        structures: {
            container: [],
            road: []
        },
        activityPID: '',
      }
    }

    return roomState;
  }
}