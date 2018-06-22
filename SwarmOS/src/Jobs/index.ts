import { OSPackage as ControlledRoomRefiller } from "Jobs/ControlledRoomRefiller";
import { OSPackage as WorkerGroup } from "Jobs/Worker";
import { OSPackage as BootstrapRefiller } from "Jobs/BootstrapRefiller";
import { OSPackage as ScoutJob } from "Jobs/ScoutJob";
import { OSPackage as Harvester } from "Jobs/Harvester";

export const CreepJobsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        BootstrapRefiller.install(processRegistry, extensionRegistry);
        ControlledRoomRefiller.install(processRegistry, extensionRegistry);
        Harvester.install(processRegistry, extensionRegistry);
        ScoutJob.install(processRegistry, extensionRegistry);
        WorkerGroup.install(processRegistry, extensionRegistry);
    }
}