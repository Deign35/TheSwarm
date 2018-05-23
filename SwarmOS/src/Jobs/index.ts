import { OSPackage as HarvesterJob } from "Jobs/HarvesterJob";
import { OSPackage as EasyCreep } from "Jobs/EasyCreep";
import { OSPackage as EasyJobs } from "Jobs/EasyJobs";

export const CreepJobsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        EasyCreep.install(processRegistry, extensionRegistry);
        EasyJobs.install(processRegistry, extensionRegistry);
        HarvesterJob.install(processRegistry, extensionRegistry);
    }
}