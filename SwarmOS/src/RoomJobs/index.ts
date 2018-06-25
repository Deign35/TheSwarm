import { OSPackage as RoomProvider } from "RoomJobs/RoomProvider";
import { OSPackage as TowerJob } from "RoomJobs/TowerJob";
import { OSPackage as RoomMonitors } from "RoomJobs/RoomMonitors";
import { OSPackage as RoomWorkerTargeting } from "RoomJobs/RoomStateWorkerActivity";
import { OSPackage as HarvesterRoomJob } from "RoomJobs/HarvestRoomJob";

import { OSPackage as RoomEnergyMonitor } from "RoomJobs/RoomMapMonitor";

export const RoomJobs: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        HarvesterRoomJob.install(processRegistry, extensionRegistry);
        RoomEnergyMonitor.install(processRegistry, extensionRegistry);
        RoomProvider.install(processRegistry, extensionRegistry);
        RoomMonitors.install(processRegistry, extensionRegistry);
        RoomWorkerTargeting.install(processRegistry, extensionRegistry);
        TowerJob.install(processRegistry, extensionRegistry);
    }
}