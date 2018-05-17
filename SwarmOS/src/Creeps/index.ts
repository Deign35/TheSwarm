import { OSPackage as CreepRegistry } from "Creeps/CreepRegistry";
import { OSPackage as SpawnRegistry } from "Creeps/SpawnRegistry";

import { OSPackage as Builder } from "Creeps/Builder";
import { OSPackage as Harvester } from "Creeps/Harvester";
import { OSPackage as Refiller } from "Creeps/Refiller";
import { OSPackage as Upgrader } from "Creeps/Upgrader";

export const CreepsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        CreepRegistry.install(processRegistry, extensionRegistry);
        
        SpawnRegistry.install(processRegistry, extensionRegistry);

        Builder.install(processRegistry, extensionRegistry);
        Harvester.install(processRegistry, extensionRegistry);
        Refiller.install(processRegistry, extensionRegistry);
        Upgrader.install(processRegistry, extensionRegistry);
    }
}