export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_RemoteProtector, RemoteProtector);
  }
}

import { SoloCreep } from "./SoloCreep";

class RemoteProtector extends SoloCreep<RemoteProtector_Memory, MemCache> {
  protected RequestBoost(creep: Creep): boolean {
    return false;
  }
  protected GetNewSpawnID(): string | undefined {
    const room = Game.rooms[this.memory.targetRoom];
    if (!room) {
      // We have a problem.  We don't know if we should spawn an attacker or not.
      this.log.error(`Can't see room ${this.memory.targetRoom} -- RemoteProtector`);
      this.kernel.killProcess(this.pid);
      return;
    }

    const hostiles = room.find(FIND_HOSTILE_CREEPS);
    const hostilesStructures = room.find(FIND_HOSTILE_STRUCTURES);
    if (hostiles.length == 0 && hostilesStructures.length == 0) {
      return;
    }

    const body = hostiles.length > 1 ? [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
      ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, MOVE] :
      [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        ATTACK, ATTACK, ATTACK, HEAL, MOVE];
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.targetRoom + "_" + (Game.time + '_RP').slice(-6),
      owner_pid: this.pid
    }, this.memory.targetRoom, Priority_Medium, {
        parentPID: this.pid
      }, 3);
  }

  protected CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined {
    if (creep.room.name != this.memory.targetRoom) {
      return this.MoveToRoom(creep, this.memory.targetRoom);
    }

    const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length == 0) {
      const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
      if (hostileStructures.length > 0) {
        return {
          action: AT_Attack,
          targetID: hostileStructures[0].id
        }
      }
      const allies = creep.room.find(FIND_MY_CREEPS);
      for (let i = 0; i < allies.length; i++) {
        if (allies[i].hits < allies[i].hitsMax) {
          return {
            action: AT_Heal,
            targetID: allies[i].id,
          }
        }
      }

      return {
        action: AT_Suicide
      }
    }

    if (hostiles.length == 1) {
      return {
        action: AT_Attack,
        targetID: hostiles[0].id,
      }
    }

    let bestTarget = hostiles[0];
    let bestDist = 1000000;
    for (let i = 0; i < hostiles.length; i++) {
      if (hostiles[i].getActiveBodyparts(HEAL)) {
        bestDist = hostiles[i].pos.getRangeTo(creep.pos);
        bestTarget = hostiles[i];
        break;
      }
      const dist = hostiles[i].pos.getRangeTo(creep.pos);
      if (dist < bestDist) {
        bestTarget = hostiles[i];
        bestDist = dist;
      }
    }

    if (bestDist > 5) {
      return {
        action: AT_MoveToPosition,
        distance: Math.floor(bestDist / 2),
        targetID: bestTarget.id
      }
    }

    return {
      action: AT_Attack,
      targetID: bestTarget.id,
    }
  }

  HandleNoActivity(creep: Creep) { }
}