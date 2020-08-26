export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CJ_Harvester, HarvesterJob);
  }
}

import { CreepJob } from "./CreepJob";

const CJ_Harvester_LogContext: LogContext = {
  logID: CJ_Harvester,
  logLevel: LOG_INFO
}

class HarvesterJob extends CreepJob<HarvesterJob_Memory> {
  protected get logID(): string {
    return CJ_Harvester_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return CJ_Harvester_LogContext.logLevel;
  }

  RunThread(): ThreadState {
    return ThreadState_Done;
  }
}