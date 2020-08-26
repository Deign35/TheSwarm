import { PackageProviderBase } from "Core/BasicTypes";

import { OSPackage as CreepManager } from "./CreepManager";
import { OSPackage as RoomManager } from "./RoomManager";
import { OSPackage as SpawnManager } from "./SpawnManager";

class SwarmManager extends PackageProviderBase<PackageProviderMemory> {
  protected get RequiredServices(): SDictionary<ProviderService> {
    return this._reqServices;
  }
  private _reqServices: SDictionary<ProviderService> = {
    creepManager: {
      processName: PKG_CreepManager
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
    CreepManager.install(processRegistry, extensionRegistry);
    RoomManager.install(processRegistry, extensionRegistry);
    SpawnManager.install(processRegistry, extensionRegistry);

    processRegistry.register(PKG_SwarmManager, SwarmManager);
  },
}