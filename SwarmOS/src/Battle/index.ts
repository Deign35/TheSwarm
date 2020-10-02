import { OSPackage as RoomAttacker } from "./RoomAttacker";

export const BattlePackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    RoomAttacker.install(processRegistry, extensionRegistry);
  }
}