import { OSPackage as Dismantler } from "./Dismantler";
import { OSPackage as MineralHarvester } from "./MineralHarvester";
import { OSPackage as RoomBooter } from "./RoomBooter";
import { OSPackage as RoomDefender } from "./RoomDefender";
import { OSPackage as RoomDefender_2 } from "./RoomDefender_2";
import { OSPackage as Scout } from "./Scout";

export const JobsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    Dismantler.install(processRegistry, extensionRegistry);
    MineralHarvester.install(processRegistry, extensionRegistry);
    RoomBooter.install(processRegistry, extensionRegistry);
    RoomDefender.install(processRegistry, extensionRegistry);
    RoomDefender_2.install(processRegistry, extensionRegistry);
    Scout.install(processRegistry, extensionRegistry);
  }
}