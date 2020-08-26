import { OSPackage as EnergyManager } from "./EnergyManager";
import { OSPackage as TowerJob } from "./TowerJob";

export const RoomsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    EnergyManager.install(processRegistry, extensionRegistry);
    TowerJob.install(processRegistry, extensionRegistry);
  }
}