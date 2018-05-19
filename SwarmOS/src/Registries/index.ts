import { OSPackage as CreepRegistry } from "Registries/CreepRegistry";
import { OSPackage as SpawnRegistry } from "Registries/SpawnRegistry";

export const RegistriesPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        CreepRegistry.install(processRegistry, extensionRegistry);
        SpawnRegistry.install(processRegistry, extensionRegistry);
    },
}
