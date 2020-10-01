import { OSPackage as ControllerClaimer } from "./ControllerClaimer";
import { OSPackage as Dismantler } from "./Dismantler";
import { OSPackage as MineralHarvester } from "./MineralHarvester";
import { OSPackage as RemoteRefiller } from "./RemoteRefiller";
import { OSPackage as RoomBooter } from "./RoomBooter";
import { OSPackage as RoomDefender } from "./RoomDefender";
import { OSPackage as RoomDefender_2 } from "./RoomDefender_2";
import { OSPackage as Scientist } from "./Scientist";
import { OSPackage as Scout } from "./Scout";
import { OSPackage as Upgrader } from "./Upgrader";

export const JobsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    ControllerClaimer.install(processRegistry, extensionRegistry);
    Dismantler.install(processRegistry, extensionRegistry);
    MineralHarvester.install(processRegistry, extensionRegistry);
    RemoteRefiller.install(processRegistry, extensionRegistry);
    RoomBooter.install(processRegistry, extensionRegistry);
    RoomDefender.install(processRegistry, extensionRegistry);
    RoomDefender_2.install(processRegistry, extensionRegistry);
    Scientist.install(processRegistry, extensionRegistry);
    Scout.install(processRegistry, extensionRegistry);
    Upgrader.install(processRegistry, extensionRegistry);
  }
}