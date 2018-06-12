import { OSPackage as TowerJob } from "RoomJobs/TowerJob";

export const RoomJobs: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        TowerJob.install(processRegistry, extensionRegistry);
    }
}