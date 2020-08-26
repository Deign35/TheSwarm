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
    let sourceIDs = Object.keys(this.memory.sources);
    for (let i = 0; i < sourceIDs.length; i++) {
      let creepID = this.memory.sources[sourceIDs[i]];
      let creep = this.creepManager.tryGetCreep(creepID, this.pid);
      if (!creep) {
        let spawnReq = this.spawnManager.getRequestStatus(creepID);
        if (spawnReq == SP_ERROR) {
          // Try to spawn a new creep
          this.memory.sources[sourceIDs[i]] = this.spawnManager.requestSpawn({
            creepName: this.memory.room + "_Harvester_" + GetRandomIndex(primes_1000),
            creepType: CT_Harvester,
            level: 0,
            owner_pid: this.pid
          },
            this.memory.room,
            Priority_High,
            {
              creepType: CT_Harvester,
              level: 0,
              parentPID: this.pid
            },
            3);
        } else if (spawnReq == SP_SPAWNING) {
          let reqContext = this.spawnManager.getRequestContext(creepID)!;
          this.memory.sources[sourceIDs[i]] = reqContext.creepName;
          this.creepManager.tryReserveCreep(reqContext.creepName, this.pid);
        }
        continue;
      }

      let source = Game.getObjectById(sourceIDs[i]) as Source;
      if (this.CreepIsInRange(AT_Harvest, creep.pos, source.pos)) {
        this.RunCreepAction({
          actionType: AT_Harvest,
          creep: creep,
          target: source
        });
      } else {
        creep.moveTo(source);
      }
    }
    return ThreadState_Done;
  }
}