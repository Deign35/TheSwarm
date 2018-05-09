declare var Memory: {
    spawnData: SpawnData_Memory
}

import { BaseProcess } from "Core/ProcessRegistry";
import { ExtensionBase } from "Core/ExtensionRegistry";

export const IN_SpawnManager = 'SpawnManager';
export const bundle: IPosisBundle<SpawnData_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(IN_SpawnManager, SpawnManager);
    },
    rootImageName: IN_SpawnManager
}

//const FRE_RoomStructures = primes_100[10]; // 10 = 29
class SpawnManager extends BaseProcess {
    protected get memory() {
        return Memory.spawnData;
    }
    handleMissingMemory() {
        if (!Memory.spawnData) {
            Memory.spawnData = {};
        }
        return Memory.spawnData;
    }
    executeProcess(): void {
        this.log.warn(`${IN_SpawnManager} has not been implemented.`, IN_SpawnManager);
    }
}

class SpawnExtension extends ExtensionBase {
    protected get memory(): SpawnData_Memory {
        return Memory.spawnData;
    }
}
