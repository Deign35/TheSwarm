export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_ControlledRoomRefiller, ControlledRoomRefiller);
  }
}
import { SoloCreep } from "./SoloCreep";

class ControlledRoomRefiller extends SoloCreep<ControlledRoomRefiller_Memory, SoloCreep_Cache> {
  protected RequestBoost(creep: Creep): boolean {
    return false;
  }
  RunThread() {
    const creep = Game.creeps[this.memory.creepID!];
    if (((creep && !creep.spawning && creep.ticksToLive! < 40) ||
      !creep && Game.time - this.memory.lastTime > 250) &&
      !this.memory.expires) {
      if (this.memory.creepID) {
        delete this.memory.activityPID;
      }
      delete this.memory.creepID;
      this.memory.lastTime = Game.time;
    }

    if (!this.memory.creepID && Game.time - this.memory.lastTime > 200 && !this.memory.expires) {
      this.memory.lastTime = Game.time;
      try {
        this.log.alert("Spawning an emergency refiller for room: " + Game.rooms[this.memory.homeRoom].link);
      } catch (e) {
        this.log.fatal("Failed to link for emergency refiller");
      }
      const sID = this.spawnManager.requestSpawn({
        body: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        creepName: this.memory.homeRoom + "_Ref_Emergency",
        owner_pid: this.pid,
      }, this.memory.homeRoom, Priority_EMERGENCY, {
          parentPID: this.pid
        }, 1);
      const spawnMem: SpawnActivity_Memory = {
        spawnID: sID,
        HC: 'CreateActivityForCreep'
      }
      const spawnPID = this.kernel.startProcess(APKG_SpawnActivity, spawnMem);
      const pid = this.kernel.startProcess(CPKG_ControlledRoomRefiller, {
        homeRoom: this.memory.homeRoom,
        targetRoom: this.memory.homeRoom,
        lastTime: Game.time,
        activityPID: spawnPID,
        expires: true
      } as ControlledRoomRefiller_Memory);
      this.kernel.setParent(spawnPID, pid);
    }
    return super.RunThread();
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
    } else if (homeRoom.energyCapacityAvailable >= 1200) {
      body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    } else if (homeRoom.energyCapacityAvailable >= 800) {
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

    let creepCapacity = creep.store.getUsedCapacity();
    if (this.cache.lastAction) {
      if (this.cache.lastAction.action == AT_Withdraw) {
        const target = Game.getObjectById<ObjectTypeWithID>(this.cache.lastAction.targetID!);
        if (target) {
          if ((target as Tombstone).store) {
            creepCapacity = Math.min(creep.store.getCapacity(), creepCapacity + (target as Tombstone).store.getUsedCapacity(RESOURCE_ENERGY));
          } else if ((target as Resource).resourceType == RESOURCE_ENERGY) {
            creepCapacity = Math.min(creep.store.getCapacity(), creepCapacity + (target as Resource).amount);
          } else {
            this.log.error(`AT_Withdraw on something without a store or resourceType property: ${JSON.stringify(target)}`);
          }
        }
      } else if (this.cache.lastAction.action == AT_Transfer) {
        const target = Game.getObjectById<ObjectTypeWithID>(this.cache.lastAction.targetID!);
        if (target) {
          if ((target as StructureExtension).store) {
            creepCapacity -= (target as StructureExtension).store.getFreeCapacity(RESOURCE_ENERGY);
          } else {
            this.log.error(`AT_Transfer on something without a store property: ${JSON.stringify(target)}`);
          }
        }
      }
    }
    if (creepCapacity <= 0 &&
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
    if ((creep.ticksToLive || 0) < 60 && creep.store.getUsedCapacity() < 0.10) {
      return {
        action: AT_Suicide,
        pos: creep.pos
      }
    }
    const nextTask = this.GetNewTarget(creep, creepCapacity);
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

  protected GetNewTarget(creep: Creep, creepCapacity: number): { targetID: ObjectID, action: ActionType } {
    let actionType: ActionType = AT_NoOp;
    let bestTarget = '';
    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    const halfEnergyNeeded = creepCapacity / 2;
    const carryRatio = creepCapacity / creep.store.getCapacity();

    let closestDist = 1000;
    if (carryRatio < 0.10) {
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
          if (container && (container.store[RESOURCE_ENERGY] || -1) >= creepCapacity) {
            const dist = container.pos.getRangeTo(creep.pos);
            if (dist < closestDist) {
              closestDist = dist;
              bestTarget = container.id;
              actionType = AT_Withdraw;
            }
          }
        }
      }

      if (creep.room.storage) {
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
        if (actionType == AT_NoOp || shouldUseStorage) {
          const storage = creep.room.storage;
          if ((storage.store[RESOURCE_ENERGY] || -1) >= creepCapacity) {
            closestDist = 0;
            bestTarget = storage.id;
            actionType = AT_Withdraw;
          }
        }
      }
    }

    if (actionType == AT_NoOp && creep.store[RESOURCE_ENERGY] > 0) {
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

        if (targetWants > creep.store.getCapacity() || targetWants <= creep.store[RESOURCE_ENERGY]) {
          const dist = nextTarget.pos.getRangeTo(creep.pos);
          if (dist < closestDist) {
            closestDist = dist;
            bestTarget = nextTarget.id;
            actionType = AT_Transfer;
          }
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

          if (targetWants > creep.store[RESOURCE_ENERGY] || targetWants <= creep.store[RESOURCE_ENERGY]) {
            const dist = nextTarget.pos.getRangeTo(creep.pos);
            if (dist < closestDist) {
              closestDist = dist;
              bestTarget = nextTarget.id;
              actionType = AT_Transfer;
            }
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

    if (actionType == AT_NoOp) {
      const targets = this.roomManager.GetRoomData(this.memory.homeRoom)!.structures[STRUCTURE_STORAGE];
      if (targets.length > 0) {
        const nextTarget = Game.getObjectById<StructureStorage>(targets[0]);
        if (nextTarget) {
          bestTarget = nextTarget.id;
          actionType = creep.store.getUsedCapacity() > 0 ? AT_Transfer : AT_Withdraw;
        }
      }
    }

    return {
      action: actionType,
      targetID: bestTarget
    }
  }
}
