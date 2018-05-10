import { bundle as Harvester } from "Creeps/Harvester"

export const creepBundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        Harvester.install(processRegistry, extensionRegistry);
    }
}