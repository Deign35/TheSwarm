declare var Memory: {
  mapData: MapManager_Memory
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

let MapCache: {
  [roomID: string]: {
    [roomID: string]: ({ exit: ExitConstant, room: string }[] | -2)
  }
} = {};
class MapManager extends BasicProcess<MapManager_Memory> {
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
  protected get logID() {
    return PKG_MapManager_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return PKG_MapManager_LogContext.logLevel!;
  }

  GetRoute(from: RoomID, to: RoomID) {
    if (!MapCache[from]) {
      MapCache[from] = {};
    }
    if (MapCache[from][to]) {
      return MapCache[from][to];
    }

    const route = Game.map.findRoute(from, to);
    MapCache[from][to] = route;
    return route;
  }
}