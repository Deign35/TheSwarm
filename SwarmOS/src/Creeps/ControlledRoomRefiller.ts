export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_ControlledRoomRefiller, ControlledRoomRefiller);
  }
}
import { SoloCreep } from "./SoloCreep";

class ControlledRoomRefiller extends SoloCreep<ControlledRoomRefiller_Memory, ControlledRoomRefiller_Cache> {
  protected RequestBoost(creep: Creep): boolean {
    return false;
  }
  protected GetNewSpawnID(): string {
    const homeRoom = Game.rooms[this.memory.homeRoom];
    const newName = this.memory.homeRoom + '_Ref';
    let body = [CARRY, CARRY, MOVE, MOVE];
    if (homeRoom.energyCapacityAvailable >= 1600) {
      body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    } else if (homeRoom.energyCapacityAvailable >= 800) {
      body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    } else if (homeRoom.energyCapacityAvailable >= 600) {
      body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    } else if (homeRoom.energyCapacityAvailable >= 400) {
      body = [CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE];
    }

    const sID = this.spawnManager.requestSpawn({
      body: body,
      creepName: newName,
      owner_pid: this.pid
    }, this.memory.homeRoom, Priority_High, {
        parentPID: this.pid
      }, 0);
    return sID;
  }

  protected CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined {
    if (creep.room.name != this.memory.targetRoom) {
      return this.MoveToRoom(creep, this.memory.targetRoom);
    }

    let creepUsedCapacity = creep.store.getUsedCapacity();
    if (this.cache.lastAction) {
      if (this.cache.lastAction.action == AT_Withdraw) {
        const target = Game.getObjectById<ObjectTypeWithID>(this.cache.lastAction.targetID!);
        if (target) {
          if ((target as Tombstone).store) {
            creepUsedCapacity = Math.min(creep.store.getCapacity(), creepUsedCapacity + (target as Tombstone).store.getUsedCapacity(RESOURCE_ENERGY));
          } else {
            this.log.error(`AT_Withdraw on something without a store property: ${JSON.stringify(target)}`);
          }
        }
      } else if (this.cache.lastAction.action == AT_Transfer) {
        const target = Game.getObjectById<ObjectTypeWithID>(this.cache.lastAction.targetID!);
        if (target) {
          if ((target as StructureExtension).store) {
            creepUsedCapacity -= (target as StructureExtension).store.getFreeCapacity(RESOURCE_ENERGY);
          } else {
            this.log.error(`AT_Transfer on something without a store property: ${JSON.stringify(target)}`);
          }
        }
      } else if (this.cache.lastAction.action == AT_Pickup) {
        const target = Game.getObjectById<Resource>(this.cache.lastAction.targetID!);
        if (target) {
          if ((target as Resource).amount > 0) {
            creepUsedCapacity = Math.min(creep.store.getCapacity(), creepUsedCapacity + (target as Resource).amount);
          }
        }
      }
    }
    if (!this.memory.isZombie && creepUsedCapacity <= 0 &&
      (creep.ticksToLive || 1500) < 1500 - ((600 / creep.body.length) * 4)) {
      let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS, {
        filter: (spawn: StructureSpawn) => {
          return !spawn.spawning;
        }
      });
      if (spawn && !spawn.spawning && creep.room.energyAvailable > (creep.bodyCost / 2.5) / creep.body.length) {
        return {
          targetID: spawn.id,
          action: AT_RenewCreep,
        }
      }
    }
    if ((creep.ticksToLive || 0) < 30 && creepUsedCapacity <= 0) {
      return {
        action: AT_Suicide,
        pos: creep.pos
      }
    }
    const nextTask = this.GetNewTarget(creep, creepUsedCapacity);
    if (!nextTask) {
      return;
    }

    return {
      targetID: nextTask.targetID,
      action: nextTask.action,
      resourceType: RESOURCE_ENERGY
    }
  }

  protected HandleNoActivity(creep: Creep) { }
  OnTick(creep?: Creep) {
    if (creep && !this.memory.isZombie) {
      const room = Game.rooms[this.memory.homeRoom];
      const carryParts = creep.getActiveBodyparts(CARRY);
      if ((room.energyCapacityAvailable >= 1600 && carryParts < 16) ||
          (room.energyCapacityAvailable >= 800 && carryParts < 8) ||
          (room.energyCapacityAvailable >= 600 && carryParts < 6) ||
          (room.energyCapacityAvailable >= 400 && carryParts < 4)) {
        const newPID = this.kernel.startProcess(this.pkgName, {
          homeRoom: this.memory.homeRoom,
          targetRoom: this.memory.targetRoom,
          creepID: this.memory.creepID,
          expires: true,
          hasRun: true,
          isZombie: true
        } as ControlledRoomRefiller_Memory);

        this.creepManager.releaseCreep(creep.name, this.pid);
        this.creepManager.tryReserveCreep(creep.name, newPID);
        this.EndProcess();
      }
    }
  }

  protected GetNewTarget(creep: Creep, creepUsedCapacity: number): { targetID: ObjectID, action: ActionType } {
    let actionType: ActionType = AT_NoOp;
    let bestTarget = '';
    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    const energyNeeded = creep.store.getCapacity() - creepUsedCapacity;
    const halfEnergyNeeded = energyNeeded / 2;
    const carryRatio = creepUsedCapacity / creep.store.getCapacity();

    let closestDist = 1000;
    if (carryRatio <= 0) {
      if (!this.cache.link) {
        const linkIDs = roomData.structures[STRUCTURE_LINK];
        for (let i = 0; i < linkIDs.length; i++) {
          const link = Game.getObjectById<StructureLink>(linkIDs[i]);
          if (!link) { continue; }
          if (link.pos.x == 1 || link.pos.x == 48 || link.pos.y == 1 || link.pos.y == 48) {
            continue;
          }
          const closeSources = link.pos.findInRange(FIND_SOURCES, 2);
          if (closeSources.length > 0) {
            continue;
          }

          this.cache.link = link.id;
          break;
        }
      }

      if (this.cache.link) {
        const link = Game.getObjectById<StructureLink>(this.cache.link);
        if (!link) {
          delete this.cache.link;
        } else {
          if (link.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            closestDist = 0;
            bestTarget = link.id;
            actionType = AT_Withdraw;
          }
        }
      }
      if (actionType == AT_NoOp && creep.room.storage) {
        const targets = roomData.structures[STRUCTURE_EXTENSION].concat(roomData.structures[STRUCTURE_SPAWN]);
        let shouldUseStorage = false;
        for (let i = 0; i < targets.length; i++) {
          let nextTarget = Game.getObjectById<ObjectTypeWithID>(targets[i]) as StructureExtension | StructureSpawn;
          if (!nextTarget) { continue; }
          if ((nextTarget.store.getFreeCapacity(RESOURCE_ENERGY) || 0) > 0) {
            shouldUseStorage = true;
            break;
          }
        }
        if (shouldUseStorage) {
          const storage = creep.room.storage;
          if ((storage.store[RESOURCE_ENERGY] || -1) >= energyNeeded) {
            closestDist = 0;
            bestTarget = storage.id;
            actionType = AT_Withdraw;
          }
        }
      }

      if (actionType == AT_NoOp && roomData.tombstones.length > 0) {
        for (let i = 0; i < roomData.tombstones.length; i++) {
          if (this.cache.lastAction && this.cache.lastAction.targetID === roomData.tombstones[i]) { continue; }
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

      if (actionType == AT_NoOp && roomData.ruins.length > 0) {
        for (let i = 0; i < roomData.ruins.length; i++) {
          if (this.cache.lastAction && this.cache.lastAction.targetID === roomData.ruins[i]) { continue; }
          const ruins = Game.getObjectById<Ruin>(roomData.ruins[i]);
          if (ruins && (ruins.store[RESOURCE_ENERGY] || -1) >= halfEnergyNeeded) {
            const dist = ruins.pos.getRangeTo(creep.pos);
            if (dist < closestDist) {
              closestDist = dist;
              bestTarget = ruins.id;
              actionType = AT_Withdraw;
            }
          }
        }
      }

      if (actionType == AT_NoOp && roomData.resources.length > 0) {
        for (let i = 0; i < roomData.resources.length; i++) {
          if (this.cache.lastAction && this.cache.lastAction.targetID === roomData.resources[i]) { continue; }
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

      if (actionType == AT_NoOp && roomData.structures[STRUCTURE_CONTAINER].length > 0) {
        for (let i = 0; i < roomData.structures[STRUCTURE_CONTAINER].length; i++) {
          if (this.cache.lastAction && this.cache.lastAction.targetID === roomData.structures[STRUCTURE_CONTAINER][i]) { continue; }
          const container = Game.getObjectById<StructureContainer>(roomData.structures[STRUCTURE_CONTAINER][i]);
          if (container && (container.store[RESOURCE_ENERGY] || -1) >= energyNeeded) {
            const dist = container.pos.getRangeTo(creep.pos);
            if (dist < closestDist) {
              closestDist = dist;
              bestTarget = container.id;
              actionType = AT_Withdraw;
            }
          }
        }
      }
    }

    if (actionType == AT_NoOp && creepUsedCapacity > 0) {
      // Find a delivery target
      let targets = roomData.structures[STRUCTURE_TOWER];
      for (let i = 0; i < targets.length; i++) {
        if (this.cache.lastAction && this.cache.lastAction.targetID === targets[i]) { continue; }
        const nextTarget = Game.getObjectById<ObjectTypeWithID>(targets[i]) as StructureTower;
        if (!nextTarget) { continue; }

        const targetWants = nextTarget.store.getFreeCapacity(RESOURCE_ENERGY);
        if (targetWants < 300) {
          continue;
        }
        const dist = nextTarget.pos.getRangeTo(creep.pos);
        if (dist < closestDist) {
          closestDist = dist;
          bestTarget = nextTarget.id;
          actionType = AT_Transfer;
        }
      }

      if (actionType == AT_NoOp) {
        targets = roomData.structures[STRUCTURE_EXTENSION].concat(roomData.structures[STRUCTURE_SPAWN]);
        for (let i = 0; i < targets.length; i++) {
          if (this.cache.lastAction && this.cache.lastAction.targetID === targets[i]) { continue; }
          const nextTarget = Game.getObjectById<ObjectTypeWithID>(targets[i]) as StructureExtension | StructureSpawn;
          if (!nextTarget) { continue; }

          const targetWants = nextTarget.store.getFreeCapacity(RESOURCE_ENERGY);
          if (targetWants <= 0) {
            continue;
          }

          const dist = nextTarget.pos.getRangeTo(creep.pos);
          if (dist < closestDist) {
            closestDist = dist;
            bestTarget = nextTarget.id;
            actionType = AT_Transfer;
          }
        }

        if (actionType == AT_NoOp && Game.rooms[this.memory.homeRoom]) {
          const target = Game.rooms[this.memory.homeRoom].terminal;
          if (target) {
            const targetWants = 50000 - target.store.getUsedCapacity(RESOURCE_ENERGY);
            if (targetWants > 0) {
              bestTarget = target.id;
              actionType = AT_Transfer;
            }
          }
        }

        if (actionType == AT_NoOp && roomData.structures[STRUCTURE_LAB].length > 0) {
          for (let i = 0; i < roomData.structures[STRUCTURE_LAB].length; i++) {
            if (this.cache.lastAction && this.cache.lastAction.targetID === roomData.structures[STRUCTURE_LAB][i]) { continue; }
            const target = Game.getObjectById<StructureLab>(roomData.structures[STRUCTURE_LAB][i]);
            if (target && target.store[RESOURCE_ENERGY] < LAB_ENERGY_CAPACITY) {
              bestTarget = target.id;
              actionType = AT_Transfer;
            }
          }
        }
      }
    }

    if (actionType == AT_NoOp && creepUsedCapacity > 0) {
      const storage = creep.room.storage;
      if (storage && (!this.cache.lastAction || this.cache.lastAction.targetID != storage.id)) {
        bestTarget = storage.id;
        actionType = AT_Transfer;
      }
    }

    return {
      action: actionType,
      targetID: bestTarget
    }
  }
}
