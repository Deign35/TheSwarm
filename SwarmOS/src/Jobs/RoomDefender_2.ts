/*export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_RoomDefender_2, RoomDefender_2);
  }
}
import { SoloJob } from "./SoloJob";

class RoomDefender_2 extends SoloJob<RoomDefender_2_Memory, MemCache> {
  RunThread() {
    if (this.memory.creepID) {
      const creep = Game.creeps[this.memory.creepID];
      if (!creep) { return super.RunThread(); }
      const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1);
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
        if (creep.pos.inRangeTo(target, 1)) {
          creep.attack(target);
        }
      }
    }
    return super.RunThread();
  }

  EndTick() {
    if (Game.time % 11 == 0) {
      if (this.memory.activityPID && this.kernel.getProcessByPID(this.memory.activityPID!)) {
        this.kernel.killProcess(this.memory.activityPID);
      }
    }
  }

  protected GetNewSpawnID(): string {
    let body = [TOUGH, MOVE, ATTACK];
    if (Game.rooms[this.memory.homeRoom].energyCapacityAvailable >= 5100) {
      body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 100
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                 // 500
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,                                     // 400
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,                                     // 400
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,                                     // 400
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,                                     // 400
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,                                     // 400
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK                                      // 400
      ]; // 3000
    } else if (Game.rooms[this.memory.homeRoom].energyCapacityAvailable >= 1850) {
      body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, // 100
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,                             // 400
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,                                     // 400
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,                                     // 400
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,                                     // 400
        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK                                      // 400
      ]; // 2100
    }
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.targetRoom + "_" + (Game.time + '_RD2').slice(-7),
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
      const numCUARequired = creep.getActiveBodyparts(ATTACK) * 30;
      const numCGARequired = creep.getActiveBodyparts(TOUGH) * 30;
      const numCZARequired = creep.getActiveBodyparts(MOVE) * 30;
      if (creep.room.terminal) {
        if (this.terminalNetwork.HasResourceInNetwork(RESOURCE_CATALYZED_UTRIUM_ACID, numCUARequired)) {
          roomData.labRequests.push({
            amount: numCUARequired,
            creepID: creep.name,
            forBoost: true,
            resourceType: RESOURCE_CATALYZED_UTRIUM_ACID
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

    return this.creepManager.CreateNewCreepActivity({
      action: AT_Attack,
      creepID: creep.name,
      targetID: target.id
    }, this.pid);
  }

  HandleNoActivity(creep: Creep) { }
}*/