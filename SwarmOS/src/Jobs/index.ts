import { OSPackage as Harvester } from "./Harvester"

export const JobsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    Harvester.install(processRegistry, extensionRegistry);
  }
}