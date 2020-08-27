import { OSPackage as Harvester } from "./Harvester"
import { OSPackage as Harvester_1 } from "./Harvester_1"

export const CreepsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    Harvester.install(processRegistry, extensionRegistry);
    Harvester_1.install(processRegistry, extensionRegistry);
  }
}