export const OSPackage: IPackage = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(APKG_SpawnActivity, SpawnActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class SpawnActivity extends BasicProcess<SpawnActivity_Memory> {
    @extensionInterface(EXT_SpawnManager)
    protected spawnManager!: ISpawnManagerExtensions;

    RunThread(): ThreadState {
        let status = this.spawnManager.getRequestStatus(this.memory.sID);
        let newCreepName = undefined;
        switch (status) {
            case (SP_QUEUED):
                let context = this.spawnManager.getRequestContext(this.memory.sID)!;
                break;
            case (SP_COMPLETE):
            case (SP_SPAWNING):
                newCreepName = this.spawnManager.getRequestContext(this.memory.sID)!.creepName;
            case (SP_ERROR):
            default:
                this.EndProcess(newCreepName);
        }
        return ThreadState_Done;
    }

    protected EndProcess(creepName?: string) {
        this.spawnManager.cancelRequest(this.memory.sID);
        super.EndProcess(creepName);
    }
}