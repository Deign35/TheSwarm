import { OSPackage as TowerJob } from "./TowerJob"

export const RoomsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    TowerJob.install(processRegistry, extensionRegistry);
  }
}