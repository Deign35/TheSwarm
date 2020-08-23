export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_SpawnActivity, SpawnActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class SpawnActivity extends BasicProcess<SpawnActivity_Memory> {
    @extensionInterface(EXT_SpawnRegistry)
    protected spawnRegistry!: ISpawnRegistryExtensions;

    RunThread(): ThreadState {
        let status = this.spawnRegistry.getRequestStatus(this.memory.sID);
        let newCreepName = undefined;
        switch (status) {
            case (SP_QUEUED):
                let context = this.spawnRegistry.getRequestContext(this.memory.sID)!;
                break;
            case (SP_COMPLETE):
            case (SP_SPAWNING):
                newCreepName = this.spawnRegistry.getRequestContext(this.memory.sID)!.n;
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