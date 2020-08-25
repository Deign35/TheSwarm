export const OSPackage: IPackage<MemBase> = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CJ_Harvester, HarvesterJob);
  }
}

import { BasicProcess } from "Core/BasicTypes";

const CJ_Harvester_LogContext: LogContext = {
  logID: CJ_Harvester,
  logLevel: LOG_INFO
}

const ENABLE_PROFILING = true;
class HarvesterJob extends BasicProcess<HarvesterJob_Memory> {
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
  @extensionInterface(EXT_SpawnManager)
  spawnManager!: ISpawnManagerExtensions

  protected get logID(): string {
    return CJ_Harvester_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return CJ_Harvester_LogContext.logLevel;
  }

  PrepTick() {
  }

  RunThread(): ThreadState {
    let start = Game.cpu.getUsed();
    try {

    } catch (ex) {
      this.log.info(`An exception occurred while trying experimental stuff (${ex})`);
    }

    if (ENABLE_PROFILING) {
      this.log.info(`Experimental CPU used (${Game.cpu.getUsed() - start})`);
    }
    return ThreadState_Done;
  }

  CallbackFunction(spawnID: SpawnRequestID) {
    this.log.info(`Callback function called: ${spawnID}`);
  }
}