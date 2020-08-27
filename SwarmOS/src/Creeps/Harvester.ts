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

  GetCreepSpawnName(): string {
    return this.memory.roomID + '_Harvester_' + GetRandomIndex(primes_1000);
  }
  GetCreepSpawnBody(): BodyPartConstant[] {
    let room = Game.rooms[this.memory.roomID];
    if (room.energyCapacityAvailable >= 800) {
      return [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
    } else if (room.energyCapacityAvailable >= 550) {
      return [WORK, WORK, WORK, WORK, WORK, MOVE];
    }
    return [WORK, WORK, MOVE];
  }

  RunThread(): ThreadState {
    if (!this.AssignedCreep) {
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