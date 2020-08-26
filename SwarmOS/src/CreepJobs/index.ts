import { OSPackage as HarvesterJob } from "./HarvesterJob";
import { OSPackage as WorkerJob } from "./WorkerJob";

export const CreepJobPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    HarvesterJob.install(processRegistry, extensionRegistry);
    WorkerJob.install(processRegistry, extensionRegistry);
  }
}