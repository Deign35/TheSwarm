import { OSPackage as ControlledRoomRefiller } from "./ControlledRoomRefiller";
import { OSPackage as ControllerClaimer } from "./ControllerClaimer";
import { OSPackage as Harvester } from "./Harvester";
import { OSPackage as LargeHarvester } from "./LargeHarvester";
import { OSPackage as MineralCollector } from "./MineralCollector";
import { OSPackage as MineralHarvester } from "./MineralHarvester";
import { OSPackage as RemoteRefiller } from "./RemoteRefiller";
import { OSPackage as RoomBooter } from "./RoomBooter";
import { OSPackage as RoomProtector } from "./RoomProtector";
import { OSPackage as Scientist } from "./Scientist";
import { OSPackage as Scout } from "./Scout";
import { OSPackage as Upgrader } from "./Upgrader";
import { OSPackage as Worker } from "./Worker";

export const CreepsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    ControlledRoomRefiller.install(processRegistry, extensionRegistry);
    ControllerClaimer.install(processRegistry, extensionRegistry);
    Harvester.install(processRegistry, extensionRegistry);
    LargeHarvester.install(processRegistry, extensionRegistry);
    MineralCollector.install(processRegistry, extensionRegistry);
    MineralHarvester.install(processRegistry, extensionRegistry);
    RemoteRefiller.install(processRegistry, extensionRegistry);
    RoomBooter.install(processRegistry, extensionRegistry);
    RoomProtector.install(processRegistry, extensionRegistry);
    Scientist.install(processRegistry, extensionRegistry);
    Scout.install(processRegistry, extensionRegistry);
    Upgrader.install(processRegistry, extensionRegistry);
    Worker.install(processRegistry, extensionRegistry);
  }
}