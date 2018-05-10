import { bundle as Harvester } from "Creeps/Harvester"
import { ExtensionRegistry } from "Core/ExtensionRegistry";

export const creepBundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: ExtensionRegistry) {
        Harvester.install(processRegistry, extensionRegistry);
    }
}