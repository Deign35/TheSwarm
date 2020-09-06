import { OSPackage as RemoteProtector } from "./RemoteProtector";

export const BattlePackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    RemoteProtector.install(processRegistry, extensionRegistry);
  }
}