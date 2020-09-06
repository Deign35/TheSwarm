import { OSPackage as EnergyManager } from "./EnergyManager";
import { OSPackage as LabManager } from "./LabManager";
import { OSPackage as RemoteManager } from "./RemoteManager";
import { OSPackage as TowerJob } from "./TowerJob";

export const RoomsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    EnergyManager.install(processRegistry, extensionRegistry);
    LabManager.install(processRegistry, extensionRegistry);
    RemoteManager.install(processRegistry, extensionRegistry);
    TowerJob.install(processRegistry, extensionRegistry);
  }
}