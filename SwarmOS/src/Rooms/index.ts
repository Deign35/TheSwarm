import { OSPackage as AssimilateRoomManager } from "./AssimilateRoomManager";
import { OSPackage as HomeRoomManager } from "./HomeRoomManager";
import { OSPackage as LabManager } from "./LabManager";
import { OSPackage as RemoteManager } from "./RemoteManager";
import { OSPackage as RoomController } from "./RoomController";
import { OSPackage as RoomPlanner } from "./RoomPlanner";
import { OSPackage as TowerJob } from "./TowerJob";
import { OSPackage as WallWatcher } from "./WallWatcher";

export const RoomsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    AssimilateRoomManager.install(processRegistry, extensionRegistry);
    HomeRoomManager.install(processRegistry, extensionRegistry);
    LabManager.install(processRegistry, extensionRegistry);
    RemoteManager.install(processRegistry, extensionRegistry);
    RoomController.install(processRegistry, extensionRegistry);
    RoomPlanner.install(processRegistry, extensionRegistry);
    TowerJob.install(processRegistry, extensionRegistry);
    WallWatcher.install(processRegistry, extensionRegistry);
  }
}