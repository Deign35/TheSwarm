export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Harvester, Harvester);
  }
}

import { CreepJobBase } from "./CreepJobBase";

const CPKG_Harvester_LogContext: LogContext = {
  logID: CPKG_Harvester,
  logLevel: LOG_TRACE
}

class Harvester extends CreepJobBase<HarvesterMemory> {
  protected get logID(): string {
    return CPKG_Harvester_LogContext.logID;
  }
  protected get logLevel(): LogLevel {
    return CPKG_Harvester_LogContext.logLevel;
  }

  RunThread(): ThreadState {
    if (!this.AssignedCreep) {
      let spawnStatus = this.spawnManager.getRequestStatus(this.memory.creepID);
      if (spawnStatus == SP_ERROR) {
        this.memory.creepID = this.spawnManager.requestSpawn({
          creepName: this.memory.roomID + '_Harvester_' + GetRandomIndex(primes_1000),
          creepType: CT_Harvester,
          level: 0,
          owner_pid: this.pid
        }, this.memory.roomID, Priority_High, {
            creepType: CT_Harvester,
            level: 0,
            parentPID: this.pid
          }, 3);
      } else {
        if (spawnStatus == SP_SPAWNING || spawnStatus == SP_COMPLETE) {
          let spawnContext = this.spawnManager.getRequestContext(this.memory.creepID)!;
          if (this.spawnManager.cancelRequest(this.memory.creepID)) {
            this.memory.creepID = spawnContext.creepName;
            this.creepManager.tryReserveCreep(spawnContext.creepName, this.pid);
          }
        }
      }

      return ThreadState_Done;
    }

    let target = Game.getObjectById(this.memory.targetID) as Source | Mineral;
    if (!target) {
      // Not in the room, need to travel to the room...
      return ThreadState_Done;
    }

    if (this.ValidateActionTarget(AT_Harvest, target)) {
      if (this.CreepIsInRange(AT_Harvest, this.AssignedCreep.pos, target.pos)) {
        this.RunCreepAction({
          actionType: AT_Harvest,
          creep: this.AssignedCreep,
          target: target
        });
      } else {
        this.MoveCreep(this.AssignedCreep, target.pos);
      }
    }
    return ThreadState_Done;
  }
}