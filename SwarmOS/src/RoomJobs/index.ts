import { OSPackage as RoomProvider } from "RoomJobs/RoomProvider";
import { OSPackage as TowerJob } from "RoomJobs/TowerJob";
import { OSPackage as RoomStateActivities } from "RoomJobs/RoomStateActivities";
import { OSPackage as RoomWorkerTargeting } from "RoomJobs/RoomStateWorkerActivity";

export const RoomJobs: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        RoomProvider.install(processRegistry, extensionRegistry);
        RoomStateActivities.install(processRegistry, extensionRegistry);
        RoomWorkerTargeting.install(processRegistry, extensionRegistry);
        TowerJob.install(processRegistry, extensionRegistry);
    }
}