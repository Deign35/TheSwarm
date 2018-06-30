import { OSPackage as RoomProvider } from "RoomJobs/RoomProvider";
import { OSPackage as TowerJob } from "RoomJobs/TowerJob";
import { OSPackage as RoomMonitors } from "RoomJobs/RoomMonitors";
import { OSPackage as RoomWorkerTargeting } from "RoomJobs/RoomStateWorkerActivity";
import { OSPackage as HarvesterRoomJob } from "RoomJobs/HarvestRoomJob";
import { OSPackage as RoomRoadGenerator } from "RoomJobs/RoomRoadGenerator";

import { OSPackage as RoomMapMonitor } from "RoomJobs/RoomMapMonitor";

export const RoomJobs: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        RoomMapMonitor.install(processRegistry, extensionRegistry);
        HarvesterRoomJob.install(processRegistry, extensionRegistry);
        RoomProvider.install(processRegistry, extensionRegistry);
        RoomMonitors.install(processRegistry, extensionRegistry);
        RoomWorkerTargeting.install(processRegistry, extensionRegistry);
        TowerJob.install(processRegistry, extensionRegistry);
        RoomRoadGenerator.install(processRegistry, extensionRegistry);
    }
}