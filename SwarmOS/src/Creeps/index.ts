import { OSPackage as Harvester } from "./Harvester";

export const CreepsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    Harvester.install(processRegistry, extensionRegistry);
  }
}