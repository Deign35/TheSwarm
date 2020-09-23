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
      if (target && target.structureType == STRUCTURE_RAMPART && target.hits <= 3000) {
        let repaired = false;
        for (let j = 0; j < roomData.structures[STRUCTURE_TOWER].length; j++) {
          const tower = Game.getObjectById<StructureTower>(roomData.structures[STRUCTURE_TOWER][j]);
          if (tower && tower.store[RESOURCE_ENERGY] > 300) {
            tower.repair(target);
            repaired = true;
          }
        }

        if (repaired) {
          return ThreadState_Done;
        }
      }
    }

    const myCreeps = Game.rooms[this.memory.homeRoom].find(FIND_MY_CREEPS);
    for (let i = 0; i < myCreeps.length; i++) {
      if (myCreeps[i].hits < myCreeps[i].hitsMax) {
        const towerIDs = roomData.structures[STRUCTURE_TOWER];
        for (let j = 0; j < towerIDs.length; j++) {
          const tower = Game.getObjectById<StructureTower>(towerIDs[j]);
          if (tower && tower.store[RESOURCE_ENERGY] > 500) {
            tower.heal(myCreeps[i]);
          }
        }

        return ThreadState_Done;
      }
    }

    const otherCreeps = Game.rooms[this.memory.homeRoom].find(FIND_HOSTILE_CREEPS);
    if (otherCreeps.length == 0) {
      this.sleeper.sleep(this.pid, 8);
      return ThreadState_Done;
    }

    const hostiles = this.GetHostileTargets(otherCreeps);
    if (hostiles.length == 0) {
      this.sleeper.sleep(this.pid, 8);
      return ThreadState_Done;
    }

    const towerIDs = roomData.structures[STRUCTURE_TOWER];
    for (let i = 0; i < towerIDs.length; i++) {
      const tower = Game.getObjectById<StructureTower>(towerIDs[i]);
      if (tower && tower.store[RESOURCE_ENERGY] > 0) {
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
      }
    }

    return ThreadState_Done;
  }

  GetHostileTargets(possibleTargets: Creep[]): Creep[] {
    const hostiles: Creep[] = [];
    const workers: Creep[] = [];
    const claimers: Creep[] = [];
    const others: Creep[] = [];
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
      } else {
        others.push(creep);
      }
    }

    if (claimers.length > 0) {
      return claimers;
    } else if (workers.length > 0) {
      return workers;
    } else if (hostiles.length > 0) {
      return hostiles;
    } else {
      return others;
    }
  }
}