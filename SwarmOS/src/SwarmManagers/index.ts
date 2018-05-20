//import { OSPackage as RoomManager } from "SwarmManagers/RoomManager";
import { OSPackage as FlagManager } from "SwarmManagers/FlagManager";

import { PackageProviderBase } from "Core/AdvancedTypes";

class SwarmManager extends PackageProviderBase<PackageProviderMemory> {
    static install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SwarmManager, SwarmManager);
        //RoomManager.install(processRegistry, extensionRegistry);
        FlagManager.install(processRegistry, extensionRegistry);
    }
    protected get RequiredServices(): SDictionary<ProviderService> {
        return this._reqServices;
    }
    private _reqServices!: SDictionary<ProviderService>;

    OnProcessInstantiation() {
        this._reqServices = {
            roomManager: {
                processName: PKG_RoomManager
            },
            spawnManager: {
                processName: PKG_SpawnRegistry
            },
            flagManager: {
                processName: PKG_FlagManager
            },
            creepManager: {
                processName: PKG_CreepRegistry
            }
        }
        super.OnProcessInstantiation();
    }
}

export const bundle: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        SwarmManager.install(processRegistry, extensionRegistry);
    },
}
