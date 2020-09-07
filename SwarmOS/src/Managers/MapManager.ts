declare var Memory: {
  mapData: MapManager_Memory
}

declare var MemoryCache: {
  mapCache: {
    [roomID: string]: {
      [roomID: string]: ({ exit: ExitConstant, room: string }[] | -2)
    }
  }
}
import { BasicProcess, ExtensionBase } from "Core/BasicTypes";

export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(PKG_MapManager, MapManager);
    extensionRegistry.register(EXT_MapManager, new MapManagerExtensions(extensionRegistry));
  }
}
const PKG_MapManager_LogContext: LogContext = {
  logID: PKG_MapManager,
  logLevel: LOG_INFO
}

MemoryCache.mapCache = {};
class MapManager extends BasicProcess<MapManager_Memory, MemCache> {
  get memory(): MapManager_Memory {
    if (!Memory.mapData) {
      this.log.warn(`Initializing MapManager memory`);
      Memory.mapData = {}
    }
    return Memory.mapData;
  }
  protected get logID() {
    return PKG_MapManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_MapManager_LogContext.logLevel!;
  }

  RunThread(): ThreadState {
    return ThreadState_Done;
  }
}

class MapManagerExtensions extends ExtensionBase implements IMapManagerExtensions {
  get memory(): MapManager_Memory {
    if (!Memory.mapData) {
      this.log.warn(`Initializing CreepManager memory`);
      Memory.mapData = {
      }
    }

    return Memory.mapData;
  }
  get cache() {
    if (!MemoryCache.mapCache) {
      MemoryCache.mapCache = {};
    }

    return MemoryCache.mapCache;
  }
  protected get logID() {
    return PKG_MapManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_MapManager_LogContext.logLevel!;
  }

  GetRoute(from: RoomID, to: RoomID) {
    if (!this.cache[from]) {
      this.cache[from] = {};
    }
    if (this.cache[from][to]) {
      return this.cache[from][to];
    }

    const route = Game.map.findRoute(from, to, {
      routeCallback: this.GetRoomWeight
    });
    this.cache[from][to] = route;
    return route;
  }

  private GetRoomWeight(roomName: RoomID) {
    const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
    try {
      if (parsed && parsed.length > 2) {
        const EWVal = +parsed[1] % 10;
        const NSVal = +parsed[2] % 10;
        if ((EWVal == 4 || EWVal == 5 || EWVal == 6) &&
          (NSVal == 4 || NSVal == 5 || NSVal == 6)) {
          return 3;
        }
      }
    } catch (ex) {
      this.log.error("ERROR occured trying to parse the roomName\n" + ex);
    }

    return 1;
  }
}

/**
 * Get type of room from it's name.
 *
 * @author engineeryo
 *
Room.getType = function (roomName) {
  const res = /[EW](\d+)[NS](\d+)/.exec(roomName);
  const [, EW, NS] = res;
  const EWI = EW % 10, NSI = NS % 10;
  if (EWI === 0 || NSI === 0) {
    return 'Highway';
  } else if (EWI === 5 && NSI === 5) {
    return 'Center';
  } else if (Math.abs(5 - EWI) <= 1 && Math.abs(5 - NSI) <= 1) {
    return 'SourceKeeper';
  } else {
    return 'Room';
  }
};
*/