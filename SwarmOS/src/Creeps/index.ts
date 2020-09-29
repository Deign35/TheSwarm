import { OSPackage as ControlledRoomRefiller } from "./ControlledRoomRefiller";
import { OSPackage as Harvester } from "./Harvester";
import { OSPackage as Worker } from "./Worker";

export const CreepsPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    ControlledRoomRefiller.install(processRegistry, extensionRegistry);
    Harvester.install(processRegistry, extensionRegistry);
    Worker.install(processRegistry, extensionRegistry);
  }
}