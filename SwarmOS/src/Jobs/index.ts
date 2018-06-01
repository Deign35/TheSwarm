import { OSPackage as HarvesterJob } from "Jobs/HarvestJob";
import { OSPackage as EasyJobs } from "Jobs/EasyJobs";

export const CreepJobsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        EasyJobs.install(processRegistry, extensionRegistry);
        HarvesterJob.install(processRegistry, extensionRegistry);
    }
}