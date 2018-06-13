import { OSPackage as ControlledRoomRefiller } from "Jobs/ControlledRoomRefiller";
import { OSPackage as HarvesterJob } from "Jobs/HarvestJob";
import { OSPackage as WorkerGroup } from "Jobs/Worker";
import { OSPackage as BootstrapRefiller } from "Jobs/BootstrapRefiller";
import { OSPackage as ScoutJob } from "Jobs/ScoutJob";

import { OSPackage as RemoteHarvester } from "Jobs/RemoteHarvester";

export const CreepJobsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        BootstrapRefiller.install(processRegistry, extensionRegistry);
        ControlledRoomRefiller.install(processRegistry, extensionRegistry);
        HarvesterJob.install(processRegistry, extensionRegistry);
        ScoutJob.install(processRegistry, extensionRegistry);
        WorkerGroup.install(processRegistry, extensionRegistry);
        RemoteHarvester.install(processRegistry, extensionRegistry);
    }
}