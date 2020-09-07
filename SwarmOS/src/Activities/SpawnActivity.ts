export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(APKG_SpawnActivity, SpawnActivity);
  }
}

import { BasicProcess } from "Core/BasicTypes";

class SpawnActivity extends BasicProcess<SpawnActivity_Memory, MemCache> {
  @extensionInterface(EXT_SpawnManager)
  protected spawnManager!: ISpawnManagerExtensions;

  RunThread(): ThreadState {
    const status = this.spawnManager.getRequestStatus(this.memory.spawnID);
    let newCreepName = undefined;
    switch (status) {
      case (SP_QUEUED):
        break;
      case (SP_COMPLETE):
      case (SP_SPAWNING):
        newCreepName = this.spawnManager.getRequestContext(this.memory.spawnID)!.creepName;
      case (SP_ERROR):
      default:
        this.EndProcess(newCreepName);
    }

    return ThreadState_Done;
  }

  protected EndProcess(creepName?: string) {
    this.spawnManager.cancelRequest(this.memory.spawnID);
    super.EndProcess(creepName);
  }
}