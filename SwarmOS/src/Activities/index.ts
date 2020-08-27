import { OSPackage as CreepActivity } from "./CreepActivity"

export const ActivitiesPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    CreepActivity.install(processRegistry, extensionRegistry);
  }
}