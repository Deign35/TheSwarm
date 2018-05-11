import { bundle as Harvester } from "Creeps/Harvester";
import { bundle as Refiller } from "Creeps/Refiller";
import { bundle as Upgrader } from "Creeps/Upgrader";

export const creepBundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        Harvester.install(processRegistry, extensionRegistry);
        Refiller.install(processRegistry, extensionRegistry);
        Upgrader.install(processRegistry, extensionRegistry);
    }
}