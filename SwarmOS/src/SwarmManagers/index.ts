import { OSPackage as FlagManager } from "SwarmManagers/FlagManager";

import { PackageProviderBase } from "Core/BasicTypes";

class SwarmManager extends PackageProviderBase<PackageProviderMemory> {
    static install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SwarmManager, SwarmManager);
        FlagManager.install(processRegistry, extensionRegistry);
    }
    protected get RequiredServices(): SDictionary<ProviderService> {
        return this._reqServices;
    }
    private _reqServices: SDictionary<ProviderService> = {
        roomManager: {
            processName: PKG_RoomManager
        },
        spawnManager: {
            processName: PKG_SpawnRegistry
        },
        flagManager: {
            processName: PKG_FlagManager
        },
        creepManager: {
            processName: PKG_CreepRegistry
        }
    }
}

export const bundle: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        SwarmManager.install(processRegistry, extensionRegistry);
    },
}
