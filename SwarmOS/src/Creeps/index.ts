import { OSPackage as ControlledRoomRefiller } from "./ControlledRoomRefiller";
import { OSPackage as ControllerClaimer } from "./ControllerClaimer";
import { OSPackage as Harvester } from "./Harvester";
import { OSPackage as LargeHarvester } from "./LargeHarvester";
import { OSPackage as RemoteRefiller } from "./RemoteRefiller";
import { OSPackage as Worker } from "./Worker";
import { OSPackage as Upgrader } from "./Upgrader";

export const CreepsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    ControlledRoomRefiller.install(processRegistry, extensionRegistry);
    ControllerClaimer.install(processRegistry, extensionRegistry);
    Harvester.install(processRegistry, extensionRegistry);
    LargeHarvester.install(processRegistry, extensionRegistry);
    RemoteRefiller.install(processRegistry, extensionRegistry);
    Upgrader.install(processRegistry, extensionRegistry);
    Worker.install(processRegistry, extensionRegistry);
  }
}