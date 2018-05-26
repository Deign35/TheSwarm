import { OSPackage as CreepRegistry } from "Registries/CreepRegistry";
import { OSPackage as RoomRegistry } from "Registries/RoomRegistry";
import { OSPackage as SpawnRegistry } from "Registries/SpawnRegistry";
import { OSPackage as FlagRegistry } from "Registries/FlagRegistry";
import { PackageProviderBase } from "Core/BasicTypes";

import { OSPackage as RoomBase } from "Rooms/BasicCreepScript"

export const RegistriesPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        CreepRegistry.install(processRegistry, extensionRegistry);
        RoomRegistry.install(processRegistry, extensionRegistry);
        SpawnRegistry.install(processRegistry, extensionRegistry);
        FlagRegistry.install(processRegistry, extensionRegistry);

        RoomBase.install(processRegistry, extensionRegistry);

        processRegistry.register(PKG_SwarmManager, SwarmManager);
    },
}



class SwarmManager extends PackageProviderBase<PackageProviderMemory> {
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