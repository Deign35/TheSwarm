import { PackageProviderBase } from "Core/BasicTypes";

import { OSPackage as RoomManager } from "./RoomManager";
import { OSPackage as SpawnManager } from "./SpawnManager";

class SwarmManager extends PackageProviderBase<PackageProviderMemory> {
  protected get RequiredServices(): SDictionary<ProviderService> {
    return this._reqServices;
  }
  private _reqServices: SDictionary<ProviderService> = {
    spawnManager: {
      processName: PKG_SpawnManager
    },
    roomManager: {
      processName: PKG_RoomManager
    }
  }
}

export const RegistriesPackage: IPackage<{}> = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    SpawnManager.install(processRegistry, extensionRegistry);
    processRegistry.register(PKG_SwarmManager, SwarmManager);
  },
}