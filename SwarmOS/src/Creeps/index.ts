import { OSPackage as ControlledRoomRefiller } from "./ControlledRoomRefiller";
import { OSPackage as ControllerClaimer } from "./ControllerClaimer";
import { OSPackage as Harvester } from "./Harvester";
import { OSPackage as LargeHarvester } from "./LargeHarvester";
import { OSPackage as Worker } from "./Worker";

export const CreepsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    ControlledRoomRefiller.install(processRegistry, extensionRegistry);
    ControllerClaimer.install(processRegistry, extensionRegistry);
    Harvester.install(processRegistry, extensionRegistry);
    LargeHarvester.install(processRegistry, extensionRegistry);
    Worker.install(processRegistry, extensionRegistry);
  }
}