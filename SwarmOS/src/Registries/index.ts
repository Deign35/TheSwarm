import { OSPackage as CreepRegistry } from "Registries/CreepRegistry";
import { OSPackage as RoomRegistry } from "Registries/RoomRegistry";
import { OSPackage as SpawnRegistry } from "Registries/SpawnRegistry";
import { OSPackage as RoomBase } from "Rooms/BasicRoom"

export const RegistriesPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        CreepRegistry.install(processRegistry, extensionRegistry);
        RoomRegistry.install(processRegistry, extensionRegistry);
        SpawnRegistry.install(processRegistry, extensionRegistry);

        RoomBase.install(processRegistry, extensionRegistry);
    },
}
