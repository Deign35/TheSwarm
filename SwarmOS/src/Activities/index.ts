import { OSPackage as CreepActivity } from "./CreepActivity"
import { OSPackage as SpawnActivity } from "./SpawnActivity"

export const ActivitiesPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    CreepActivity.install(processRegistry, extensionRegistry);
    SpawnActivity.install(processRegistry, extensionRegistry);
  }
}