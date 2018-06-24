import { ColonyManagementPackage } from "ColonyManagement/index";

import { OSPackage as CreepRegistry } from "Registries/CreepRegistry";
import { OSPackage as RoomRegistry } from "Registries/RoomRegistry";
import { OSPackage as SpawnRegistry } from "Registries/SpawnRegistry";
import { OSPackage as FlagRegistry } from "Registries/FlagRegistry";
import { OSPackage as MapDirectory } from "Registries/MapDirectory";

import { PackageProviderBase } from "Core/BasicTypes";
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
        },
        cli: {
            processName: PKG_SwarmCLI
        },
    }
}

export const RegistriesPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        ColonyManagementPackage.install(processRegistry, extensionRegistry);

        CreepRegistry.install(processRegistry, extensionRegistry);
        RoomRegistry.install(processRegistry, extensionRegistry);
        SpawnRegistry.install(processRegistry, extensionRegistry);
        FlagRegistry.install(processRegistry, extensionRegistry);
        MapDirectory.install(processRegistry, extensionRegistry);

        processRegistry.register(PKG_SwarmManager, SwarmManager);
    },
}