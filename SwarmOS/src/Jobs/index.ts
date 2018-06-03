import { OSPackage as HarvesterJob } from "Jobs/HarvestJob";
import { OSPackage as WorkerGroup } from "Jobs/GenericWorkerGroup";

export const CreepJobsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        HarvesterJob.install(processRegistry, extensionRegistry);
        WorkerGroup.install(processRegistry, extensionRegistry);
    }
}