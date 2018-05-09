import { bundle as RoomManager } from "SwarmManagers/RoomManager";
import { bundle as SpawnManager } from "SwarmManagers/SpawnManager";
import { ExtensionRegistry } from "Core/ExtensionRegistry";

export const processBundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: ExtensionRegistry) {
        RoomManager.install(processRegistry, extensionRegistry);
        SpawnManager.install(processRegistry, extensionRegistry);
    }
}