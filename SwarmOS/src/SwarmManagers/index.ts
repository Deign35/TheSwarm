import { bundle as RoomManager } from "SwarmManagers/RoomManager";
import { bundle as SpawnManager } from "SwarmManagers/SpawnManager";
import { ExtensionRegistry } from "Core/ExtensionRegistry";
import { ServiceProviderBase, InitData } from "Core/BasicTypes";

class SwarmManager extends ServiceProviderBase<ServiceProviderMemory> {
    protected RequiredServices: SDictionary<InitData> = {
        roomManager: {
            processName: PKG_RoomManager
        },
        spawnManager: {
            processName: PKG_SpawnManager
        }
    }
}

export const bundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: ExtensionRegistry) {
        processRegistry.register(PKG_SwarmManager, SwarmManager);
        RoomManager.install(processRegistry, extensionRegistry);
        SpawnManager.install(processRegistry, extensionRegistry);
    }
}