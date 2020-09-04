export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Worker, Worker);
  }
}
import { SoloJob } from "./SoloJob";

class Worker extends SoloJob<Worker_Memory> {

  private hasRun!: boolean;
  private _roomData!: RoomState;
  protected get roomData() {
    return this._roomData;
  }

  PrepTick() {
    this.hasRun = false;
    this._roomData = this.roomManager.GetRoomData(this.memory.targetRoom)!;
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
    const homeRoom = Game.rooms[this.memory.roomID];
    const energyCapacity = homeRoom.energyCapacityAvailable;
    let body = [WORK, CARRY, CARRY, MOVE, MOVE];
    if (energyCapacity >= 1100) {
      body = [WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE]
    } else if (energyCapacity >= 600) {
      body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    }
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.roomID + '_' + (Game.time + '_WR').slice(-6),
      owner_pid: this.pid
    }, this.memory.roomID, Priority_Low, {
        parentPID: this.pid
      }, 1);
  }
  protected CreateCustomCreepActivity(creep: Creep): string | undefined {
    const carryRatio = creep.store.getUsedCapacity() / creep.store.getCapacity();
    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    if (carryRatio > 0.50) {
      for (let i = 0; i < roomData.needsRepair.length; i++) {
        const repairTarget = Game.getObjectById(roomData.needsRepair[i]);
        if (repairTarget) {
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

      return this.creepManager.CreateNewCreepActivity({
        action: AT_Upgrade,
        creepID: creep.name,
        targetID: roomData.structures[STRUCTURE_CONTROLLER][0]
      }, this.pid)
    }


    let actionType: ActionType = AT_NoOp;
    let bestTarget = '';
    const energyNeeded = creep.store.getCapacity() - (creep.store.getUsedCapacity() || 0);

    let closestDist = 1000;

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

    if (actionType == AT_NoOp && roomData.structures[STRUCTURE_STORAGE].length > 0) {
      const storage = Game.getObjectById<StructureStorage>(roomData.structures[STRUCTURE_STORAGE][0]);
      if (storage) {
        bestTarget = storage.id;
        actionType = AT_Withdraw;
      }
    }

    return this.creepManager.CreateNewCreepActivity({
      targetID: bestTarget,
      action: actionType,
      creepID: creep.name
    }, this.pid);
  }

  HandleNoActivity() {
    this.hasRun = false;
  }
}