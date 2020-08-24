import { PackageProviderBase } from "Core/BasicTypes";

import { OSPackage as SpawnManager } from "./SpawnManager";

class SwarmManager extends PackageProviderBase<PackageProviderMemory> {
    protected get RequiredServices(): SDictionary<ProviderService> {
        return this._reqServices;
    }
    private _reqServices: SDictionary<ProviderService> = {
        spawnManager: {
            processName: PKG_SpawnManager
        }
    }
}

export const RegistriesPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        SpawnManager.install(processRegistry, extensionRegistry);
        processRegistry.register(PKG_SwarmManager, SwarmManager);
    },
}