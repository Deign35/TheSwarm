import { bundle as RoomManager } from "SwarmManagers/RoomManager";
import { bundle as SpawnManager } from "SwarmManagers/SpawnManager";
import { ExtensionRegistry } from "Core/ExtensionRegistry";
import { ServiceProviderBase, InitData } from "Core/BasicTypes";
import { IN_SpawnManager } from "SwarmManagers/SpawnManager";
import { IN_RoomManager } from "SwarmManagers/RoomManager";

class SwarmManager extends ServiceProviderBase<ServiceProviderMemory> {
    protected RequiredServices: SDictionary<InitData> = {
        roomManager: {
            processName: IN_RoomManager
        },
        spawnManager: {
            processName: IN_SpawnManager
        }
    }
}

export const IN_SwarmManager = 'SwarmManager';

export const bundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: ExtensionRegistry) {
        processRegistry.register(IN_SwarmManager, SwarmManager);
        RoomManager.install(processRegistry, extensionRegistry);
        SpawnManager.install(processRegistry, extensionRegistry);
    }
}