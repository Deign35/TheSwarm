export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Upgrader, Upgrader);
  }
}
import { SoloJob } from "./SoloJob";

class Upgrader extends SoloJob<Upgrader_Memory, MemCache> {
  protected GetNewSpawnID(): string {
    this.memory.hasRequestedBoost = false;
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
  protected CreateCustomCreepActivity(creep: Creep): string | undefined {
    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    if (this.memory.needsBoost) {
      const labIDs = Object.keys(roomData.labOrders);
      for (let i = 0; i < labIDs.length; i++) {
        const order = roomData.labOrders[labIDs[i]];
        if (order.creepIDs && order.creepIDs.includes(creep.name) && order.amount > 0) {
          return this.creepManager.CreateNewCreepActivity({
            action: AT_MoveToPosition,
            creepID: creep.name,
            amount: 1,
            targetID: labIDs[i]
          }, this.pid);
        }
      }
      // If we're here then no boost orders are present
      this.memory.needsBoost = false;
    }

    if (!this.memory.hasRequestedBoost && (creep.spawning || creep.ticksToLive! > 1480)) {
      const numResourceRequired = creep.getActiveBodyparts(WORK) * 30;
      if (creep.room.terminal && creep.room.terminal.store.getUsedCapacity(RESOURCE_GHODIUM_HYDRIDE) >= numResourceRequired) {
        roomData.labRequests.push({
          amount: numResourceRequired,
          creepID: creep.name,
          forBoost: true,
          resourceType: RESOURCE_GHODIUM_HYDRIDE
        });
        this.memory.hasRequestedBoost = true;
        this.memory.needsBoost = true;
      }
    }

    const carryRatio = creep.store.getUsedCapacity() / creep.store.getCapacity();
    if (carryRatio >= 0.50) {
      if (creep.room.controller && creep.room.controller.my) {
        return this.creepManager.CreateNewCreepActivity({
          action: AT_Upgrade,
          creepID: creep.name,
          targetID: creep.room.controller.id
        }, this.pid)
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

    return this.creepManager.CreateNewCreepActivity({
      targetID: bestTarget,
      action: actionType,
      creepID: creep.name,
      resourceType: RESOURCE_ENERGY
    }, this.pid);
  }

  HandleNoActivity(creep: Creep) { }
}