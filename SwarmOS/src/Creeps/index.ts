import { bundle as Harvester } from "Creeps/Harvester";
import { bundle as Refiller } from "Creeps/Refiller";
import { bundle as Upgrader } from "Creeps/Upgrader";
import { bundle as Builder } from "Creeps/Builder";

export const creepBundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        Builder.install(processRegistry, extensionRegistry);
        Harvester.install(processRegistry, extensionRegistry);
        Refiller.install(processRegistry, extensionRegistry);
        Upgrader.install(processRegistry, extensionRegistry);
    }
}