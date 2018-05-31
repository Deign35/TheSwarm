export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_SpawnActivity, SpawnActivity);
    }
}

import { SlimProcess } from "Core/BasicTypes";

class SpawnActivity extends SlimProcess<SpawnActivity_Memory> {
    @extensionInterface(EXT_SpawnRegistry)
    protected spawnRegistry!: ISpawnRegistryExtensions;
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;

    RunThread(): ThreadState {
        let status = this.spawnRegistry.getRequestStatus(this.memory.sID);
        let newCreepName = undefined;
        switch (status) {
            case (SP_QUEUED):
                let context = this.spawnRegistry.getRequestContext(this.memory.sID)!;
                this.sleeper.sleep(this.pid, 7);
                break;
            case (SP_COMPLETE):
            case (SP_SPAWNING):
                newCreepName = this.spawnRegistry.getRequestContext(this.memory.sID)!.n;
                this.creepRegistry.tryReserveCreep(newCreepName, this.parentPID);
            case (SP_ERROR):
            default:
                this.EndProcess(newCreepName);
        }
        return ThreadState_Done;
    }

    protected EndProcess(creepName?: string) {
        this.spawnRegistry.cancelRequest(this.memory.sID);
        super.EndProcess(creepName);
    }
}