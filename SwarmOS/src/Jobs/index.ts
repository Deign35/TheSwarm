import { OSPackage as ControlledRoomRefiller } from "./ControlledRoomRefiller";
import { OSPackage as Harvester } from "./Harvester";
import { OSPackage as MineralHarvester } from "./MineralHarvester";
import { OSPackage as Scout } from "./Scout";
import { OSPackage as Worker } from "./Worker";

export const JobsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    ControlledRoomRefiller.install(processRegistry, extensionRegistry);
    Harvester.install(processRegistry, extensionRegistry);
    MineralHarvester.install(processRegistry, extensionRegistry);
    Scout.install(processRegistry, extensionRegistry);
    Worker.install(processRegistry, extensionRegistry);
  }
}