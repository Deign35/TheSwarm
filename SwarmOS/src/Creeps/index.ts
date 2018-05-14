import { OSPackage as Harvester } from "Creeps/Harvester";
import { OSPackage as Refiller } from "Creeps/Refiller";
import { OSPackage as Upgrader } from "Creeps/Upgrader";
import { OSPackage as Builder } from "Creeps/Builder";

export const creepBundle: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        Builder.install(processRegistry, extensionRegistry);
        Harvester.install(processRegistry, extensionRegistry);
        Refiller.install(processRegistry, extensionRegistry);
        Upgrader.install(processRegistry, extensionRegistry);
    }
}