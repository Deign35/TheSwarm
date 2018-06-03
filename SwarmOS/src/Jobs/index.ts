import { OSPackage as HarvesterJob } from "Jobs/HarvestJob";
import { OSPackage as WorkerGroup } from "Jobs/GenericWorkerGroup";
import { OSPackage as BootRoom } from "Jobs/BootstrapJob";
import { OSPackage as BootstrapRefiller } from "Jobs/BootstrapRefiller"

export const CreepJobsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        BootRoom.install(processRegistry, extensionRegistry);
        BootstrapRefiller.install(processRegistry, extensionRegistry);
        HarvesterJob.install(processRegistry, extensionRegistry);
        WorkerGroup.install(processRegistry, extensionRegistry);
    }
}