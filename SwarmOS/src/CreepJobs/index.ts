import { OSPackage as HarvesterJob } from "./HarvesterJob"

export const CreepJobPackage: IPackage<{}> = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    HarvesterJob.install(processRegistry, extensionRegistry);
  }
}