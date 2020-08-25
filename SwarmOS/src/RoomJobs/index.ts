import { OSPackage as RoomJobCreeps } from "./RoomJobCreeps"

export const RoomJobPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    RoomJobCreeps.install(processRegistry, extensionRegistry);
  }
}