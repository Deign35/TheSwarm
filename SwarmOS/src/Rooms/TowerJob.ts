export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(RPKG_Towers, TowerJob);
  }
}
import { BasicProcess } from "Core/BasicTypes";

class TowerJob extends BasicProcess<Tower_Memory, MemCache> {
  @extensionInterface(EXT_RoomManager)
  protected roomManager!: IRoomManagerExtension;
  RunThread(): ThreadState {
    let roomData = this.roomManager.GetRoomData(this.memory.homeRoom)!;
    for (let i = 0; i < roomData.needsRepair.length; i++) {
      const target = Game.getObjectById<Structure>(roomData.needsRepair[i]);
      if (target && target.structureType == STRUCTURE_RAMPART && target.hits <= 300) {
        for (let j = 0; j < roomData.structures[STRUCTURE_TOWER].length; j++) {
          const tower = Game.getObjectById<StructureTower>(roomData.structures[STRUCTURE_TOWER][j]);
          if (tower && tower.store[RESOURCE_ENERGY] > 800) {
            tower.repair(target);
          }
        }
      }
    }

    const otherCreeps = Game.rooms[this.memory.homeRoom].find(FIND_HOSTILE_CREEPS);
    if (otherCreeps.length == 0) {
      this.sleeper.sleep(this.pid, 6);
      return ThreadState_Done;
    }

    const hostiles = this.GetHostileTargets(otherCreeps);
    if (hostiles.length == 0) {
      this.sleeper.sleep(this.pid, 6);
      return ThreadState_Done;
    }

    const towerIDs = roomData.structures.tower;
    for (let i = 0; i < towerIDs.length; i++) {
      const tower = Game.getObjectById<StructureTower>(towerIDs[i])!;
      if (tower.store[RESOURCE_ENERGY] > 0) {
        let closestCreep = 0
        let distance = tower.pos.getRangeTo(hostiles[closestCreep]);
        for (let j = 1; j < hostiles.length; j++) {
          if (distance <= 5) {
            break;
          }
          const dist = tower.pos.getRangeTo(hostiles[j]);
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
          const expectedDamage = Math.floor(damage);
          if (expectedDamage > hostiles[closestCreep].hits) {
            hostiles.splice(closestCreep);
          }
        }
      }
    }

    return ThreadState_Done;
  }

  GetHostileTargets(possibleTargets: Creep[]): Creep[] {
    const hostiles: Creep[] = [];
    const workers: Creep[] = [];
    const claimers: Creep[] = [];
    for (let i = 0; i < possibleTargets.length; i++) {
      const creep = possibleTargets[i];
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