export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CJ_Worker, WorkerJob);
  }
}

import { CreepJob } from "./CreepJob";

const CJ_Worker_LogContext: LogContext = {
  logID: CJ_Worker,
  logLevel: LOG_INFO
}

class WorkerJob extends CreepJob<WorkerJob_Memory> {
  protected get logID(): string {
    return CJ_Worker_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return CJ_Worker_LogContext.logLevel;
  }

  RunThread(): ThreadState {
    while (this.memory.creepIDs.length + this.memory.spawnIDs.length < this.memory.numWorkers) {
      this.memory.spawnIDs.push(this.spawnManager.requestSpawn({
        creepName: this.memory.room + "_Worker_" + GetRandomIndex(primes_1000),
        creepType: CT_Worker,
        level: 0,
        owner_pid: this.pid
      },
        this.memory.room,
        Priority_Low,
        {
          creepType: CT_Worker,
          level: 0,
          parentPID: this.pid
        },
        3));
    }

    for (let i = 0; i < this.memory.creepIDs.length; i++) {
      let creep = this.creepManager.tryGetCreep(this.memory.creepIDs[i], this.pid);
      if (!creep) {
        this.memory.creepIDs.splice(i--);
        continue;
      }

      
    }

    // Do spawns after creeps so we don't accidently delete a creep that is spawning next tick.
    for (let i = 0; i < this.memory.spawnIDs.length; i++) {
      let spawnReq = this.spawnManager.getRequestStatus(this.memory.spawnIDs[i]);
      if (spawnReq == SP_ERROR) {
        this.memory.spawnIDs.splice(i--);
      } else if (spawnReq == SP_SPAWNING) {
        let spawnContext = this.spawnManager.getRequestContext(this.memory.spawnIDs[i])!;
        this.memory.creepIDs.push(spawnContext.creepName);
        this.memory.spawnIDs.splice(i--);
      }
    }

    return ThreadState_Done;
  }
}