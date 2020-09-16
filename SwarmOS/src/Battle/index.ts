import { OSPackage as RemoteProtector } from "./RemoteProtector";
import { OSPackage as RoomAttacker } from "./RoomAttacker";

export const BattlePackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    RemoteProtector.install(processRegistry, extensionRegistry);
    RoomAttacker.install(processRegistry, extensionRegistry);
  }
}