import { OSPackage as Harvester } from "Creeps/Harvester";
import { OSPackage as Refiller } from "Creeps/Refiller";
import { OSPackage as Upgrader } from "Creeps/Upgrader";
import { OSPackage as Builder } from "Creeps/Builder";
import { OSPackage as CreepRunner } from "Creeps/CreepRunner";

export const SwarmOSCreepsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        CreepRunner.install(processRegistry, extensionRegistry);

        Builder.install(processRegistry, extensionRegistry);
        Harvester.install(processRegistry, extensionRegistry);
        Refiller.install(processRegistry, extensionRegistry);
        Upgrader.install(processRegistry, extensionRegistry);
    }
}