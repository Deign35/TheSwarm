import { bundle as RoomManager } from "SwarmManagers/RoomManager";
import { ExtensionRegistry } from "Core/ExtensionRegistry";

export const processBundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: ExtensionRegistry) {
        RoomManager.install(processRegistry, extensionRegistry);
    }
}