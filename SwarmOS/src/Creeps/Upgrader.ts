export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Upgrader, Upgrader);
  }
}
import { SoloCreep } from "./SoloCreep";

class Upgrader extends SoloCreep<Upgrader_Memory, SoloCreep_Cache> {
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
      creepName: this.memory.targetRoom + '_' + (Game.time + '_Up').slice(-6),
      owner_pid: this.pid
    }, this.memory.homeRoom, Priority_Lowest, {
        parentPID: this.pid
      }, 0);
  }
  protected CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined {
    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    let carryUsedCapacity = creep.store.getUsedCapacity(RESOURCE_ENERGY);
    if (this.cache.lastAction) {
      if (this.cache.lastAction.action == AT_Withdraw) {
        const target = Game.getObjectById<ObjectTypeWithID>(this.cache.lastAction.targetID!);
        if (target) {
          if ((target as Tombstone).store) {
            carryUsedCapacity = Math.min(creep.store.getCapacity(), carryUsedCapacity + (target as Tombstone).store.getUsedCapacity(RESOURCE_ENERGY));
          } else {
            this.log.error(`AT_Withdraw on something without a store property: ${JSON.stringify(target)}`);
          }
        }
      } else if (this.cache.lastAction.action == AT_Pickup) {
        const target = Game.getObjectById<Resource>(this.cache.lastAction.targetID!);
        if (target) {
          if ((target as Resource).amount > 0) {
            carryUsedCapacity = Math.min(creep.store.getCapacity(), carryUsedCapacity + (target as Resource).amount);
          }
        }
      } else if (this.cache.lastAction.action == AT_Upgrade) {
        carryUsedCapacity -= creep.getActiveBodyparts(WORK);
      }
    }
    const carryRatio = carryUsedCapacity / creep.store.getCapacity();
    if (carryRatio >= 0.50) {
      if (creep.room.controller && creep.room.controller.my) {
        return {
          action: AT_Upgrade,
          targetID: creep.room.controller.id
        }
      }
    }

    let actionType: ActionType = AT_NoOp;
    let bestTarget = '';
    let closestDist = 1000;
    const energyNeeded = creep.store.getCapacity() - carryUsedCapacity;
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

    if (actionType == AT_NoOp && creep.room.storage) {
      if ((creep.room.storage.store[RESOURCE_ENERGY] || -1) >= energyNeeded) {
        bestTarget = creep.room.storage.id;
        actionType = AT_Withdraw;
      }
    }

    return {
      targetID: bestTarget,
      action: actionType,
      resourceType: RESOURCE_ENERGY
    }
  }

  HandleNoActivity(creep: Creep) { }
}