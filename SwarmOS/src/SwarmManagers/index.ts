import { bundle as RoomManager } from "SwarmManagers/RoomManager";
import { bundle as SpawnManager } from "SwarmManagers/SpawnManager";
import { bundle as FlagManager } from "SwarmManagers/FlagManager";
import { bundle as InterruptManager } from "SwarmManagers/InterruptManager"
import { bundle as TestInterrupt } from "SwarmManagers/TestInterruptManager"

import { ServiceProviderBase, InitData } from "Core/BasicTypes";

class SwarmManager extends ServiceProviderBase<ServiceProviderMemory> {
    protected RequiredServices: SDictionary<InitData> = {
        /*roomManager: {
            processName: PKG_RoomManager
        },
        spawnManager: {
            processName: PKG_SpawnManager
        },
        flagManager: {
            processName: PKG_FlagManager
        },*/
        /*interruptManager: {
            processName: PKG_InterruptManager
        },*/
        interruptTester: {
            processName: PKG_TestInterrupt
        },
        int2: {
            processName: 'PKG_Test2'
        }
    }
}

export const bundle: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SwarmManager, SwarmManager);
        /*RoomManager.install(processRegistry, extensionRegistry);
        SpawnManager.install(processRegistry, extensionRegistry);
        FlagManager.install(processRegistry, extensionRegistry);*/
        InterruptManager.install(processRegistry, extensionRegistry);
        TestInterrupt.install(processRegistry, extensionRegistry);
    }
}