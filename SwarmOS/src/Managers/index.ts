import { PackageProviderBase } from "Core/BasicTypes";

import { OSPackage as CLIManager } from "./CLIManager";
import { OSPackage as CreepManager } from "./CreepManager";
import { OSPackage as FlagManager } from "./FlagManager";
import { OSPackage as MapManager } from "./MapManager";
import { OSPackage as MarketManager } from "./MarketManager";
import { OSPackage as RoomManager } from "./RoomManager";
import { OSPackage as SpawnManager } from "./SpawnManager";

class SwarmManager extends PackageProviderBase<PackageProviderMemory, MemCache> {
  protected get RequiredServices(): SDictionary<ProviderService> {
    return this._reqServices;
  }
  private _reqServices: SDictionary<ProviderService> = {
    cliManager: {
      processName: PKG_CLIManager
    },
    creepManager: {
      processName: PKG_CreepManager
    },
    flagManager: {
      processName: PKG_FlagManager
    },
    mapManager: {
      processName: PKG_MapManager
    },
    marketManager: {
      processName: PKG_MarketManager
    },
    roomManager: {
      processName: PKG_RoomManager
    },
    spawnManager: {
      processName: PKG_SpawnManager
    },
  }
}

export const ManagersPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    CLIManager.install(processRegistry, extensionRegistry);
    CreepManager.install(processRegistry, extensionRegistry);
    FlagManager.install(processRegistry, extensionRegistry);
    MapManager.install(processRegistry, extensionRegistry);
    MarketManager.install(processRegistry, extensionRegistry);
    RoomManager.install(processRegistry, extensionRegistry);
    SpawnManager.install(processRegistry, extensionRegistry);

    processRegistry.register(PKG_SwarmManager, SwarmManager);
  },
}