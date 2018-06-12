import { OSPackage as RoomProvider } from "RoomJobs/RoomProvider";
import { OSPackage as TowerJob } from "RoomJobs/TowerJob";

export const RoomJobs: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        RoomProvider.install(processRegistry, extensionRegistry);
        TowerJob.install(processRegistry, extensionRegistry);
    }
}