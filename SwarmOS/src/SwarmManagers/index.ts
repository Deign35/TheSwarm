import { bundle as RoomManager } from "SwarmManagers/RoomManager";
import { bundle as FlagManager } from "SwarmManagers/FlagManager";
import { bundle as TestInterrupt } from "SwarmManagers/TestInterruptManager"

import { PackageProviderBase, InitData } from "Core/BasicTypes";

const TESTING_ENABLED = false;
class SwarmManager extends PackageProviderBase<PackageProviderMemory> {
    static install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_SwarmManager, SwarmManager);
        RoomManager.install(processRegistry, extensionRegistry);
        FlagManager.install(processRegistry, extensionRegistry);
    }
    protected get RequiredServices(): SDictionary<InitData> {
        return this._reqServices;
    }
    private _reqServices!: SDictionary<InitData>;

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
        }
        if (TESTING_ENABLED) {
            this.kernel.installPackages([testPackage]);
            this._reqServices['testListener'] = { processName: FT_InterruptListener }
            this._reqServices['testNotifier'] = { processName: FT_InterruptNotifier }
        }
        super.OnProcessInstantiation();
    }
}

export const bundle: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        SwarmManager.install(processRegistry, extensionRegistry);
    },
}

const testPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        TestInterrupt.install(processRegistry, extensionRegistry);
    }
}