export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(BPKG_RoomAttacker, RoomAttacker);
  }
}

import { BattleSquad } from "./BattleSquad";

class RoomAttacker extends BattleSquad<RoomAttacker_Memory, RoomAttacker_Cache> {
  RunThread(): ThreadState {
    this.cache.attackerAttacked = false;
    const attacker = this.creepManager.tryGetCreep(this.memory.squad[0].creepID!, this.pid);
    const healer = this.creepManager.tryGetCreep(this.memory.squad[1].creepID!, this.pid);

    if (healer) {
      if (healer.hits < healer.hitsMax) {
        healer.heal(healer);
      } else if (attacker && attacker.hits < attacker.hitsMax) {
        if (healer.pos.getRangeTo(attacker) > 1) {
          healer.rangedHeal(attacker);
        } else {
          healer.heal(attacker);
        }
      }
    }

    if (attacker) {
      let hostiles = attacker.room.find(FIND_HOSTILE_CREEPS);
      if (hostiles.length > 0) {
        let count = 0;
        for (let i = 0; i < hostiles.length; i++) {
          if (attacker.pos.getRangeTo(hostiles[i]) <= 3) {
            attacker.rangedAttack(hostiles[i]);
            this.cache.attackerAttacked = true;
            count++;
          }
        }

        if (count >= 3) {
          attacker.rangedMassAttack();
        }
      }

      if (!this.cache.attackerAttacked) {
        attacker.rangedMassAttack();
      }
    }
    return super.RunThread();
  }

  EndTick() {
    if (Game.time % 11 == 0) {
      for (let i = 0; i < this.memory.squad.length; i++) {
        if (this.memory.squad[i].activityPID && this.kernel.getProcessByPID(this.memory.squad[i].activityPID!)) {
          this.kernel.killProcess(this.memory.squad[i].activityPID);
        }
      }
    }
  }

  protected GetNewSpawnID(squadID: number): string | undefined {
    const homeRoom = Game.rooms[this.memory.homeRoom];
    if (squadID == 0) {
      let body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 50
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 500
        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK // 750
      ]; // 1300

      if (homeRoom.energyCapacityAvailable >= 2600) {
        body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 100
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 500
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, // 600
          RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE // 1400
        ]; // 2600
      }
      return this.spawnManager.requestSpawn({
        body: body,
        creepName: this.memory.targetRoom + "_" + (Game.time + '_RAA').slice(-6),
        owner_pid: this.pid
      }, this.memory.homeRoom, Priority_High, {
          parentPID: this.pid
        }, 0);
    } else if (squadID == 1) {
      let body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 50
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 400
        HEAL, HEAL, HEAL // 750
      ];  // 1200

      if (homeRoom.energyCapacityAvailable >= 2100) {
        body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 100
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, // 500
          MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE // 1500
        ]; // 2100
      }
      return this.spawnManager.requestSpawn({
        body: body,
        creepName: this.memory.targetRoom + "_" + (Game.time + '_RAH').slice(-6),
        owner_pid: this.pid
      }, this.memory.homeRoom, Priority_High, {
          parentPID: this.pid
        }, 0);
    } else {
      throw new Error("Too many in RoomAttackerSquad");
    }
  }

  protected CreateCustomCreepActivity(squadID: number, creep: Creep): string | undefined {
    if (squadID == 0) {
      if (creep.room.name != this.memory.targetRoom) {
        const pathToRoom = this.mapManager.GetRoute(creep.room.name, this.memory.targetRoom);
        if (pathToRoom == -2) { throw new Error("No path to chosen room"); }
        if (pathToRoom.length > 1 && creep.room.name != pathToRoom[pathToRoom.length - 2].room) {
          return this.MoveToRoom(creep, pathToRoom[pathToRoom.length - 2].room);
        } else {
          // We're in the next room to the target room.
          const otherCreep = this.creepManager.tryGetCreep(this.memory.squad[1].creepID!, this.pid);
          if (!otherCreep || otherCreep.pos.getRangeTo(creep) > 1) {
            let exit;
            if (pathToRoom.length > 0) {
              exit = creep.pos.findClosestByPath(pathToRoom[0].exit);
            }
            if (!exit || creep.pos.getRangeTo(exit) < 5) { return; }
            return this.creepManager.CreateNewCreepActivity({
              action: AT_MoveToPosition,
              creepID: creep.name,
              pos: exit,
              amount: 5
            }, this.pid);
          } else if (otherCreep) {
            return this.MoveToRoom(creep, this.memory.targetRoom);
          }
        }
        return undefined;
      }

      const enemyStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
      let target;
      let distToTarget = 10000;
      for (let i = 0; i < enemyStructures.length; i++) {
        if (enemyStructures[i].structureType == STRUCTURE_TOWER) {
          // found our target.
          const dist = creep.pos.getRangeTo(enemyStructures[i]);
          if (distToTarget > dist) {
            target = enemyStructures[i];
            distToTarget = dist;
          }
        }
      }

      if (!target) {
        const enemySpawns = creep.room.find(FIND_HOSTILE_SPAWNS);
        if (enemySpawns.length > 0) {
          target = enemySpawns[0];
        }
      }

      if (!target) {
        // Get a new target I guess...
        for (let i = 0; i < enemyStructures.length; i++) {
          if (enemyStructures[i].structureType == STRUCTURE_STORAGE) {
            target = enemyStructures[i];
            break;
          }
        }
      }

      if (!target) {
        for (let i = 0; i < enemyStructures.length; i++) {
          if (enemyStructures[i].structureType == STRUCTURE_EXTENSION) {
            const dist = creep.pos.getRangeTo(enemyStructures[i]);
            if (dist < distToTarget) {
              target = enemyStructures[i];
              distToTarget = dist;
            }
          }
        }
      }

      if (!target) {
        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        for (let i = 0; i < hostiles.length; i++) {
          const dist = creep.pos.getRangeTo(hostiles[i]);
          if (dist < distToTarget) {
            target = hostiles[i];
            distToTarget = dist;
          }
        }
      }

      if (target) {
        let pathToTarget = creep.pos.findPathTo(target, {
          ignoreDestructibleStructures: true,
          ignoreCreeps: true,
        });
        for (let i = 0; i < pathToTarget.length; i++) {
          const inTheWays = creep.room.lookAt(pathToTarget[i].x, pathToTarget[i].y);
          for (let j = 0; j < inTheWays.length; j++) {
            if (inTheWays[j].type == LOOK_STRUCTURES && inTheWays[j].structure!.structureType != STRUCTURE_ROAD &&
              inTheWays[j].structure!.structureType != STRUCTURE_CONTAINER) {
              return this.creepManager.CreateNewCreepActivity({
                action: AT_MoveToPosition,
                creepID: creep.name,
                targetID: inTheWays[j][LOOK_STRUCTURES]!.id
              }, this.pid);
            }
          }
        }

        if (!target) {
          const cSites = creep.room.find(FIND_HOSTILE_CONSTRUCTION_SITES);
          for (let i = 0; i < cSites.length; i++) {
            const dist = cSites[i].pos.getRangeTo(creep.pos);
            if (dist < distToTarget) {
              distToTarget = dist;
              target = cSites[i];
            }
          }
        }

        return this.creepManager.CreateNewCreepActivity({
          action: AT_MoveToPosition,
          creepID: creep.name,
          targetID: target.id
        }, this.pid);
      } else {
        return undefined;
      }
    } else if (squadID == 1) {
      if (creep.room.name != this.memory.targetRoom) {
        const pathToRoom = this.mapManager.GetRoute(creep.room.name, this.memory.targetRoom);
        if (pathToRoom == -2) { throw new Error("No path to chosen room"); }
        if (pathToRoom.length > 1 && creep.room.name != pathToRoom[pathToRoom.length - 2].room) {
          return this.MoveToRoom(creep, pathToRoom[pathToRoom.length - 2].room);
        } else {
          // We're in the next room to the target room.
          const otherCreep = this.creepManager.tryGetCreep(this.memory.squad[0].creepID!, this.pid);
          if (!otherCreep) {
            let exit;
            if (pathToRoom.length > 0) {
              exit = creep.pos.findClosestByPath(pathToRoom[0].exit);
            }
            if (!exit || creep.pos.getRangeTo(exit) < 5) { return; }
            return this.creepManager.CreateNewCreepActivity({
              action: AT_MoveToPosition,
              creepID: creep.name,
              pos: exit,
              amount: 5
            }, this.pid);
          } else {
            return this.creepManager.CreateNewCreepActivity({
              action: AT_MoveToPosition,
              creepID: creep.name,
              targetID: otherCreep.id,
              amount: 0
            }, this.pid);
          }
        }
      }

      const target = this.creepManager.tryGetCreep(this.memory.squad[0].creepID!, this.pid);
      if (!target) {
        if (this.memory.squad[0].creepID) {
          return this.creepManager.CreateNewCreepActivity({
            action: AT_Suicide,
            creepID: creep.name,
            pos: creep.pos
          }, this.pid);
        } else {
          return undefined; // Wait
        }
      }
      return this.creepManager.CreateNewCreepActivity({
        action: AT_MoveToPosition,
        creepID: creep.name,
        targetID: target.id,
        amount: 0
      }, this.pid);
    } else {
      throw new Error("Too many in RemoteProtectorSquad");
    }
  }

  HandleNoActivity(squadID: number) { }
}