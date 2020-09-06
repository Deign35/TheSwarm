export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(BPKG_RemoteProtector, RemoteProtector);
  }
}

import { BattleSquad } from "./BattleSquad";

class RemoteProtector extends BattleSquad<RemoteProtector_Memory> {
  protected GetNewSpawnID(squadID: number): string | undefined {
    if (squadID == 0) {
      const room = Game.rooms[this.memory.targetRoom];
      if (!room) {
        // We have a problem.  We don't know if we should spawn an attacker or not.
        this.log.error(`Can't see room ${this.memory.targetRoom} -- RemoteProtector`);
        return;
      }

      const hostiles = room.find(FIND_HOSTILE_CREEPS);
      if (hostiles.length == 0) {
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
    } else {
      throw new Error("Too many in RemoteProtectorSquad");
    }
  }

  protected CreateCustomCreepActivity(squadID: number, creep: Creep): string | undefined {
    if (squadID == 0) {
      if (creep.room.name != this.memory.targetRoom) {
        return this.MoveToRoom(creep, this.memory.targetRoom);
      }

      const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
      if (hostiles.length == 0) {
        const allies = creep.room.find(FIND_MY_CREEPS);
        for (let i = 0; i < allies.length; i++) {
          if (allies[i].hits < allies[i].hitsMax) {
            return this.creepManager.CreateNewCreepActivity({
              action: AT_Heal,
              creepID: creep.name,
              targetID: allies[i].id,
            }, this.pid);
          }
        }

        this.sleeper.sleep(this.pid, 10);
        return;
      }

      if (hostiles.length == 1) {
        return this.creepManager.CreateNewCreepActivity({
          action: AT_Attack,
          creepID: creep.name,
          targetID: hostiles[0].id,
        }, this.pid);
      }

      let bestTarget = hostiles[0];
      let bestDist = 1000000;
      for (let i = 0; i < hostiles.length; i++) {
        if (hostiles[i].getActiveBodyparts(HEAL)) {
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
        return this.creepManager.CreateNewCreepActivity({
          action: AT_MoveToPosition,
          creepID: creep.name,
          amount: Math.floor(bestDist / 2),
          pos: bestTarget.pos
        }, this.pid)
      }

      return this.creepManager.CreateNewCreepActivity({
        action: AT_Attack,
        creepID: creep.name,
        targetID: bestTarget.id,
        num: 1
      }, this.pid)
    } else {
      throw new Error("Too many in RemoteProtectorSquad");
    }
  }

  HandleNoActivity(squadID: number) { }
}