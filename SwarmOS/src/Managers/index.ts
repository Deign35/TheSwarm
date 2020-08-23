import { PackageProviderBase } from "Core/BasicTypes";

import { OSPackage as SpawnManager } from "./SpawnManager";

class SwarmManager extends PackageProviderBase<PackageProviderMemory> {
    protected get RequiredServices(): SDictionary<ProviderService> {
        return this._reqServices;
    }
    private _reqServices: SDictionary<ProviderService> = {
        spawnManager: {
            processname: PKG_SpawnManager
        }
    }
}

export const RegistriesPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SwarmManager, SwarmManager);
    },
}