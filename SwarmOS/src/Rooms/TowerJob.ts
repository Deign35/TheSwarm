export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_Towers, TowerJob);
  }
}
import { BasicProcess } from "Core/BasicTypes";

class TowerJob extends BasicProcess<TowerMemory> {
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  get room() {
    return Game.rooms[this.memory.roomID];
  }
  get roomData() {
    return this.roomManager.GetRoomData(this.memory.roomID)!;
  }
  RunThread(): ThreadState {
    for (let i = 0; i < this.roomData.needsRepair.length; i++) {
      let target = Game.getObjectById<Structure>(this.roomData.needsRepair[i]);
      if (target && target.structureType == STRUCTURE_RAMPART && target.hits <= 300) {
        for (let j = 0; j < this.roomData.structures[STRUCTURE_TOWER].length; j++) {
          let tower = Game.getObjectById<StructureTower>(this.roomData.structures[STRUCTURE_TOWER][j]);
          if (tower && tower.store[RESOURCE_ENERGY] > 800) {
            tower.repair(target);

          }
        }
      }
    }

    let otherCreeps = this.room.find(FIND_HOSTILE_CREEPS);
    if (otherCreeps.length == 0) {
      this.sleeper.sleep(this.pid, 6);
      return ThreadState_Done;
    }

    let hostiles = this.GetHostileTargets(otherCreeps);
    if (hostiles.length == 0) {
      this.sleeper.sleep(this.pid, 6);
      return ThreadState_Done;
    }

    let towerIDs = this.roomData.structures.tower;
    for (let i = 0; i < towerIDs.length; i++) {
      let tower = Game.getObjectById<StructureTower>(towerIDs[i])!;
      if (tower.store[RESOURCE_ENERGY] > 0) {
        let closestCreep = 0
        let distance = tower.pos.getRangeTo(hostiles[closestCreep]);
        for (let j = 1; j < hostiles.length; j++) {
          if (distance <= 5) {
            break;
          }
          let dist = tower.pos.getRangeTo(hostiles[j]);
          if (dist < distance) {
            closestCreep = j;
            distance = dist;
          }
        }

        tower.attack(hostiles[closestCreep]);

        if (hostiles.length > 0) { // This works only because we kill the healers one at a time.
          let damage = TOWER_POWER_ATTACK;
          if (distance > TOWER_OPTIMAL_RANGE) {
            if (distance > TOWER_FALLOFF_RANGE) {
              distance = TOWER_FALLOFF_RANGE
            }
            damage -= damage * TOWER_FALLOFF * (distance - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE)
          }
          let expectedDamage = Math.floor(damage);
          if (expectedDamage > hostiles[closestCreep].hits) {
            hostiles.splice(closestCreep);
          }
        }
      }
    }

    return ThreadState_Done;
  }

  GetHostileTargets(possibleTargets: Creep[]): Creep[] {
    let hostiles: Creep[] = [];
    let workers: Creep[] = [];
    let claimers: Creep[] = [];
    for (let i = 0; i < possibleTargets.length; i++) {
      let creep = possibleTargets[i];
      if (creep.getActiveBodyparts(HEAL) > 0) {
        return [creep];
      }
      if (creep.getActiveBodyparts(ATTACK) > 0) {
        hostiles.push(creep);
      } else if (creep.getActiveBodyparts(WORK) > 0) {
        workers.push(creep);
      } else if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
        hostiles.push(creep);
      } else if (creep.getActiveBodyparts(CLAIM) > 0) {
        claimers.push(creep);
      }
    }

    if (claimers.length > 0) {
      return claimers;
    } else if (workers.length > 0) {
      return workers;
    }
    return hostiles;
  }
}