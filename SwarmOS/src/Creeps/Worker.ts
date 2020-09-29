export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Worker, Worker);
  }
}
import { SoloCreep } from "./SoloCreep";

class Worker extends SoloCreep<Worker_Memory, SoloCreep_Cache> {
  protected RequestBoost(creep: Creep): boolean {
    return false;
  }
  protected GetNewSpawnID(): string {
    const homeRoom = Game.rooms[this.memory.homeRoom];
    const energyCapacity = homeRoom.energyCapacityAvailable;
    let body = [WORK, CARRY, CARRY, MOVE, MOVE];
    if (this.memory.targetRoom == this.memory.homeRoom) {
      if (energyCapacity >= 2200) {
        body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
      } else if (energyCapacity >= 1650) {
        body = [WORK, WORK, WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
      } else if (energyCapacity >= 1100) {
        body = [WORK, WORK, WORK, WORK,
          CARRY, CARRY, CARRY, CARRY,
          CARRY, CARRY, CARRY, CARRY,
          MOVE, MOVE, MOVE, MOVE,
          MOVE, MOVE]
      } else if (energyCapacity >= 550) {
        body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
      }
    } else {
      body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    }
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.targetRoom + '_' + (Game.time + '_WR').slice(-6),
      owner_pid: this.pid
    }, this.memory.homeRoom, this.memory.targetRoom == this.memory.homeRoom ? Priority_Low : Priority_Lowest, {
        parentPID: this.pid
      }, 0);
  }
  protected CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined {
    if (creep.room.name != this.memory.targetRoom) {
      return this.MoveToRoom(creep, this.memory.targetRoom);
    }

    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    const carryRatio = creep.store.getUsedCapacity() / creep.store.getCapacity();
    if (carryRatio >= 0.50) {
      let target: Structure | undefined = undefined;
      let closest: number = 100000;
      for (let i = 0; i < roomData.needsRepair.length; i++) {
        if (this.cache.lastAction && roomData.needsRepair[i] === this.cache.lastAction.targetID) { continue; }
        const repairTarget = Game.getObjectById<Structure>(roomData.needsRepair[i]);
        if (repairTarget && repairTarget.hitsMax > repairTarget.hits) {
          const dist = creep.pos.getRangeTo(repairTarget);
          if (dist < closest) {
            closest = dist;
            target = repairTarget;
          }
        }
      }

      if (target) {
        return {
          action: AT_Repair,
          targetID: target.id,
          distance: 3
        }
      }
      for (let i = 0; i < roomData.cSites.length; i++) {
        if (this.cache.lastAction && roomData.cSites[i] === this.cache.lastAction.targetID) { continue; }
        const buildTarget = Game.getObjectById(roomData.cSites[i]);
        if (buildTarget) {
          return {
            action: AT_Build,
            targetID: roomData.cSites[i],
            distance: 3
          }
        }
      }

      if (creep.room.controller && creep.room.controller.my) {
        return {
          action: AT_Upgrade,
          targetID: creep.room.controller.id,
          distance: 3
        }
      }
    }

    let actionType: ActionType = AT_NoOp;
    let bestTarget = '';
    let closestDist = 1000;
    const energyNeeded = creep.store.getFreeCapacity();
    const halfEnergyNeeded = energyNeeded / 2;

    if (actionType == AT_NoOp && roomData.tombstones.length > 0) {
      for (let i = 0; i < roomData.tombstones.length; i++) {
        const tombstone = Game.getObjectById<Tombstone>(roomData.tombstones[i]);
        if (tombstone && (tombstone.store[RESOURCE_ENERGY] || -1) >= halfEnergyNeeded) {
          const dist = tombstone.pos.getRangeTo(creep.pos);
          if (dist < closestDist) {
            closestDist = dist;
            bestTarget = tombstone.id;
            actionType = AT_Withdraw;
          }
        }
      }
    }

    if (actionType == AT_NoOp && roomData.resources.length > 0) {
      for (let i = 0; i < roomData.resources.length; i++) {
        const resource = Game.getObjectById<Resource>(roomData.resources[i]);
        if (resource && resource.resourceType == RESOURCE_ENERGY && (resource.amount || -1) >= halfEnergyNeeded) {
          const dist = resource.pos.getRangeTo(creep.pos);
          if (dist < closestDist) {
            closestDist = dist;
            bestTarget = resource.id;
            actionType = AT_Pickup;
          }
        }
      }
    }

    if (actionType == AT_NoOp && roomData.structures[STRUCTURE_STORAGE].length > 0) {
      const storage = Game.getObjectById<StructureStorage>(roomData.structures[STRUCTURE_STORAGE][0]);
      if (storage && (storage.store[RESOURCE_ENERGY] || -1) >= energyNeeded) {
        bestTarget = storage.id;
        actionType = AT_Withdraw;
      }
    }

    if (actionType == AT_NoOp && (!creep.room.controller || !creep.room.controller.my) && roomData.structures[STRUCTURE_CONTAINER].length > 0) {
      for (let i = 0; i < roomData.structures[STRUCTURE_CONTAINER].length; i++) {
        const container = Game.getObjectById<StructureContainer>(roomData.structures[STRUCTURE_CONTAINER][i]);
        if (container && container.store.getUsedCapacity(RESOURCE_ENERGY) >= energyNeeded) {
          const dist = container.pos.getRangeTo(creep.pos);
          if (dist < closestDist) {
            closestDist = dist;
            bestTarget = container.id;
            actionType = AT_Withdraw;
          }
        }
      }
    }

    if (actionType == AT_NoOp && (!creep.room.controller || !creep.room.controller.my)) {
      const enemyStructures = creep.room.find(FIND_HOSTILE_STRUCTURES);
      for (let i = 0; i < enemyStructures.length; i++) {
        const enemyStructure = enemyStructures[i];
        const dist = enemyStructure.pos.getRangeTo(creep.pos);
        if (dist < closestDist) {
          closestDist = dist;
          bestTarget = enemyStructure.id;
          actionType = AT_Dismantle;
        }
      }
    }

    return {
      targetID: bestTarget,
      action: actionType,
      resourceType: RESOURCE_ENERGY
    }
  }

  HandleNoActivity(creep: Creep) {
  }
}