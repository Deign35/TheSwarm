import { bundle as RoomManager } from "SwarmManagers/RoomManager";
import { bundle as SpawnManager } from "SwarmManagers/SpawnManager";
import { bundle as EnergyDist } from "SwarmManagers/EnergyDistribution";
import { bundle as FlagManager } from "SwarmManagers/FlagManager";
import { ExtensionRegistry } from "Core/ExtensionRegistry";
import { ServiceProviderBase, InitData } from "Core/BasicTypes";

class SwarmManager extends ServiceProviderBase<ServiceProviderMemory> {
    protected RequiredServices: SDictionary<InitData> = {
        roomManager: {
            processName: PKG_RoomManager
        },
        spawnManager: {
            processName: PKG_SpawnManager
        },
        flagManager: {
            processName: PKG_FlagManager
        }
    }
}

export const bundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: ExtensionRegistry) {
        processRegistry.register(PKG_SwarmManager, SwarmManager);
        RoomManager.install(processRegistry, extensionRegistry);
        SpawnManager.install(processRegistry, extensionRegistry);
        FlagManager.install(processRegistry, extensionRegistry);
    }
}