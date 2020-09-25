export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_RoomDefender, RoomDefender);
  }
}
import { SoloJob } from "./SoloJob";

class RoomDefender extends SoloJob<RoomDefender_Memory, MemCache> {
  RunThread() {
    if (this.memory.creepID) {
      let hasAttacked = false;
      const creep = Game.creeps[this.memory.creepID];
      if (!creep) { return super.RunThread(); }
      const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
      let target: ObjectTypeWithID | undefined = undefined;
      for (let i = 0; i < hostiles.length; i++) {
        if (hostiles[i].getActiveBodyparts(HEAL) > 0) {
          target = hostiles[i];
          break;
        } else if (!target) {
          target = hostiles[i];
        }
      }

      if (target) {
        if (creep.pos.inRangeTo(target, 3)) {
          creep.rangedAttack(target);
          hasAttacked = true;
        }
      }

      if (!hasAttacked) {
        creep.rangedMassAttack();
      }
    }
    return super.RunThread();
  }
  protected GetNewSpawnID(): string {
    let body = [TOUGH, MOVE, RANGED_ATTACK];
    if (Game.rooms[this.memory.homeRoom].energyCapacityAvailable >= 5100) {
      body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 100
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                 // 500
        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,  // 750
        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,  // 750
        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,  // 750
        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,  // 750
        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,  // 750
        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK   // 750
      ]; // 5100
    } else if (Game.rooms[this.memory.homeRoom].energyCapacityAvailable >= 1850) {
      body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 100
        MOVE, MOVE, MOVE, MOVE, MOVE,                                               // 250
        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,  // 750
        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK   // 750
      ]; // 1850
    }
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.homeRoom + "_" + (Game.time + '_RD').slice(-6),
      owner_pid: this.pid
    }, this.memory.homeRoom, Priority_Highest, {
        parentPID: this.pid
      }, 3);
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
      const numCKARequired = creep.getActiveBodyparts(RANGED_ATTACK) * 30;
      const numCGARequired = creep.getActiveBodyparts(TOUGH) * 30;
      const numCZARequired = creep.getActiveBodyparts(MOVE) * 30;
      if (creep.room.terminal) {
        if (this.terminalNetwork.HasResourceInNetwork(RESOURCE_CATALYZED_KEANIUM_ALKALIDE, numCKARequired)) {
          roomData.labRequests.push({
            amount: numCKARequired,
            creepID: creep.name,
            forBoost: true,
            resourceType: RESOURCE_CATALYZED_KEANIUM_ALKALIDE
          });
        }
        if (this.terminalNetwork.HasResourceInNetwork(RESOURCE_CATALYZED_GHODIUM_ALKALIDE, numCGARequired)) {
          roomData.labRequests.push({
            amount: numCGARequired,
            creepID: creep.name,
            forBoost: true,
            resourceType: RESOURCE_CATALYZED_GHODIUM_ALKALIDE
          });
        }
        if (this.terminalNetwork.HasResourceInNetwork(RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, numCZARequired)) {
          roomData.labRequests.push({
            amount: numCZARequired,
            creepID: creep.name,
            forBoost: true,
            resourceType: RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE
          });
        }
        this.memory.hasRequestedBoost = true;
        this.memory.needsBoost = true;
      }
    }
    if (creep.room.name != this.memory.targetRoom) {
      return this.MoveToRoom(creep, this.memory.targetRoom);
    }

    // Find a target
    let target: ObjectTypeWithID | undefined = undefined;
    let distToTarget = 10000;
    const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
    for (let i = 0; i < hostiles.length; i++) {
      if (hostiles[i].getActiveBodyparts(HEAL) > 0) {
        target = hostiles[i];
        break;
      }

      const dist = creep.pos.getRangeTo(hostiles[i]);
      if (dist < distToTarget) {
        target = hostiles[i];
        distToTarget = dist;
      }
    }

    if (!target) {
      return this.creepManager.CreateNewCreepActivity({
        action: AT_NoOp,
        creepID: creep.name,
      }, this.pid);
    }

    const pathToTarget = creep.pos.findPathTo(target, {
      range: 3
    });
    for (let i = 0; i < pathToTarget.length; i++) {
      const lookResult = creep.room.lookForAt(LOOK_STRUCTURES, pathToTarget[i].x, pathToTarget[i].y);
      for (let j = 0; j < lookResult.length; j++) {
        if (lookResult[j].structureType == STRUCTURE_RAMPART) {
          // Found the position I should move to
          return this.creepManager.CreateNewCreepActivity({
            action: AT_MoveToPosition,
            creepID: creep.name,
            pos: lookResult[j].pos
          }, this.pid);
        }
      }
    }

    const standingOn = creep.pos.lookFor(LOOK_STRUCTURES);
    for (let i = 0; i < standingOn.length; i++) {
      if (standingOn[i].structureType == STRUCTURE_RAMPART) {
        return this.creepManager.CreateNewCreepActivity({
          action: AT_NoOp,
          creepID: creep.name
        }, this.pid);
      }
    }

    return this.creepManager.CreateNewCreepActivity({
      action: AT_RangedAttack,
      creepID: creep.name,
      targetID: target.id,
      amount: 3
    }, this.pid);
  }

  HandleNoActivity(creep: Creep) { }
}