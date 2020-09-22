export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Worker, Worker);
  }
}
import { SoloJob } from "./SoloJob";

class Worker extends SoloJob<Worker_Memory, MemCache> {

  private hasRun!: boolean;
  PrepTick() {
    this.hasRun = false;
  }
  RunThread(): ThreadState {
    this.hasRun = true;
    super.RunThread();
    if (this.hasRun) {
      return ThreadState_Done;
    }

    this.hasRun = false;
    return ThreadState_Waiting;
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
  protected CreateCustomCreepActivity(creep: Creep): string | undefined {
    if (creep.room.name != this.memory.targetRoom) {
      return this.MoveToRoom(creep, this.memory.targetRoom);
    }
    const carryRatio = creep.store.getUsedCapacity() / creep.store.getCapacity();
    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    if (carryRatio >= 0.50) {
      for (let i = 0; i < roomData.needsRepair.length; i++) {
        const repairTarget = Game.getObjectById<Structure>(roomData.needsRepair[i]);
        if (repairTarget && repairTarget.hitsMax > repairTarget.hits) {
          return this.creepManager.CreateNewCreepActivity({
            action: AT_Repair,
            creepID: creep.name,
            targetID: roomData.needsRepair[i]
          }, this.pid);
        }
      }
      for (let i = 0; i < roomData.cSites.length; i++) {
        const buildTarget = Game.getObjectById(roomData.cSites[i]);
        if (buildTarget) {
          return this.creepManager.CreateNewCreepActivity({
            action: AT_Build,
            creepID: creep.name,
            targetID: roomData.cSites[i]
          }, this.pid);
        }
      }

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

  HandleNoActivity(creep: Creep) {
    this.hasRun = false;
  }
}