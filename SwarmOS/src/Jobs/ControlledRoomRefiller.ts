export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_ControlledRoomRefiller, ControlledRoomRefiller);
  }
}
import { SoloJob } from "./SoloJob";

class ControlledRoomRefiller extends SoloJob<ControlledRoomRefiller_Memory> {
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
      this.log.alert("Spawning an emergency refiller for room: " + this.memory.roomID);
      const sID = this.spawnManager.requestSpawn({
        body: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        creepName: this.memory.roomID + "_Ref_Emergency",
        owner_pid: this.pid,
      }, this.memory.roomID, Priority_EMERGENCY, {
          parentPID: this.pid
        }, 1);
      const spawnMem: SpawnActivity_Memory = {
        spawnID: sID,
        HC: 'CreateActivityForCreep'
      }
      const spawnPID = this.kernel.startProcess(APKG_SpawnActivity, spawnMem);
      const pid = this.kernel.startProcess(CPKG_ControlledRoomRefiller, {
        roomID: this.memory.roomID,
        targetRoom: this.memory.roomID,
        lastTime: Game.time,
        activityPID: spawnPID,
        expires: true
      } as ControlledRoomRefiller_Memory);
      this.kernel.setParent(spawnPID, pid);
    }
    return super.RunThread();
  }

  protected GetNewSpawnID(): string {
    const newName = this.memory.roomID + '_Ref';
    let body = [CARRY, CARRY, MOVE, MOVE];
    if (this.homeRoom.energyCapacityAvailable >= 1200) {
      body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    } else if (this.homeRoom.energyCapacityAvailable >= 800) {
      body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    } else if (this.homeRoom.energyCapacityAvailable >= 400) {
      body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
    }

    const sID = this.spawnManager.requestSpawn({
      body: body,
      creepName: newName,
      owner_pid: this.pid
    }, this.memory.roomID, Priority_High, {
        parentPID: this.pid
      }, 1);
    return sID;
  }

  protected CreateCustomCreepActivity(creep: Creep): string | undefined {
    if (creep.store.getUsedCapacity() < 0.10 &&
      (creep.ticksToLive || 1500) < 1500 - (600 / creep.body.length)) {
      let spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
      if (spawn && !spawn.spawning && spawn.store[RESOURCE_ENERGY] > (creep.bodyCost / 2.5) / creep.body.length) {
        return this.creepManager.CreateNewCreepActivity({
          targetID: spawn.id,
          action: AT_RenewCreep,
          creepID: creep.name
        }, this.pid);
      }
    }
    if ((creep.ticksToLive || 0) < 60 && creep.store.getUsedCapacity() < 0.10) {
      return;
    }
    const nextTask = this.GetNewTarget(creep);
    if (!nextTask) {
      return;
    }

    return this.creepManager.CreateNewCreepActivity({
      targetID: nextTask.targetID,
      action: nextTask.action,
      creepID: creep.name,
      resourceType: RESOURCE_ENERGY
    }, this.pid);
  }

  protected HandleNoActivity() { }

  protected GetNewTarget(creep: Creep): { targetID: ObjectID, action: ActionType } {
    let actionType: ActionType = AT_NoOp;
    let bestTarget = '';
    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    const energyNeeded = creep.store.getCapacity() - (creep.store.getUsedCapacity() || 0);
    const carryRatio = creep.store.getUsedCapacity() / creep.store.getCapacity();

    let closestDist = 1000;
    if (carryRatio < 0.10) {
      if (actionType == AT_NoOp && roomData.tombstones.length > 0) {
        for (let i = 0; i < roomData.tombstones.length; i++) {
          const tombstone = Game.getObjectById<Tombstone>(roomData.tombstones[i]);
          if (tombstone && (tombstone.store[RESOURCE_ENERGY] || -1) >= energyNeeded) {
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
          const ruins = Game.getObjectById<Ruin>(roomData.ruins[i]);
          if (ruins && (ruins.store[RESOURCE_ENERGY] || -1) >= energyNeeded) {
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
          const resource = Game.getObjectById<Resource>(roomData.resources[i]);
          if (resource && resource.resourceType == RESOURCE_ENERGY && (resource.amount || -1) >= energyNeeded) {
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

      if (creep.room.storage) {
        const targets = this.roomManager.GetRoomData(this.memory.roomID)!.structures[STRUCTURE_EXTENSION].concat(
          this.roomManager.GetRoomData(this.memory.roomID)!.structures[STRUCTURE_SPAWN]);
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
          if ((storage.store[RESOURCE_ENERGY] || -1) >= energyNeeded) {
            closestDist = 0;
            bestTarget = storage.id;
            actionType = AT_Withdraw;
          }
        }
      }
    }

    if (actionType == AT_NoOp && creep.store[RESOURCE_ENERGY] > 0) {
      // Find a delivery target
      let targets = this.roomManager.GetRoomData(this.memory.roomID)!.structures[STRUCTURE_TOWER];
      for (let i = 0; i < targets.length; i++) {
        const nextTarget = Game.getObjectById<ObjectTypeWithID>(targets[i]) as StructureTower;
        if (!nextTarget) { continue; }

        const targetWants = nextTarget.store.getFreeCapacity(RESOURCE_ENERGY);
        if (targetWants == 0) {
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
        targets = this.roomManager.GetRoomData(this.memory.roomID)!.structures[STRUCTURE_EXTENSION].concat(
          this.roomManager.GetRoomData(this.memory.roomID)!.structures[STRUCTURE_SPAWN]);
        for (let i = 0; i < targets.length; i++) {
          const nextTarget = Game.getObjectById<ObjectTypeWithID>(targets[i]) as StructureExtension | StructureSpawn;
          if (!nextTarget) { continue; }

          const targetWants = nextTarget.store.getFreeCapacity(RESOURCE_ENERGY);
          if (targetWants == 0) {
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

        if (actionType == AT_NoOp && Game.rooms[this.memory.roomID]) {
          const target = Game.rooms[this.memory.roomID].terminal;
          if (target) {
            const targetWants = 50000 - target.store.getUsedCapacity(RESOURCE_ENERGY);
            if (targetWants > 0) {
              bestTarget = target.id;
              actionType = AT_Transfer;
            }
          }
        }
      }
    }

    if (actionType == AT_NoOp) {
      const targets = this.roomManager.GetRoomData(this.memory.roomID)!.structures[STRUCTURE_STORAGE];
      if (targets.length > 0) {
        const nextTarget = Game.getObjectById<StructureStorage>(targets[0]);
        if (nextTarget) {
          bestTarget = nextTarget.id;
          actionType = creep.store.getUsedCapacity() != creep.store.getCapacity() ? AT_Withdraw : AT_Transfer;
        }
      }
    }

    return {
      action: actionType,
      targetID: bestTarget
    }
  }
}
