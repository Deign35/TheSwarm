export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_RemoteRefiller, RemoteRefiller);
  }
}
import { SoloJob } from "./SoloJob";

class RemoteRefiller extends SoloJob<RemoteRefiller_Memory, MemCache> {
  protected GetNewSpawnID(): string {
    const body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.targetRoom + "_" + (Game.time + '_Ref').slice(-8),
      owner_pid: this.pid
    }, this.memory.targetRoom, Priority_Lowest, {
        parentPID: this.pid
      }, 3)
  }

  protected CreateCustomCreepActivity(creep: Creep): string | undefined {
    if (creep.store.getUsedCapacity() > creep.store.getFreeCapacity()) {
      if (creep.room.name != this.memory.homeRoom) {
        return this.MoveToRoom(creep, this.memory.homeRoom);
      }
      if (creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] < 50000) {
        return this.creepManager.CreateNewCreepActivity({
          action: AT_Transfer,
          creepID: creep.name,
          targetID: creep.room.terminal.id,
          resourceType: RESOURCE_ENERGY
        }, this.pid);
      }
      if (creep.room.storage) {
        return this.creepManager.CreateNewCreepActivity({
          action: AT_Transfer,
          creepID: creep.name,
          targetID: creep.room.storage.id,
          resourceType: RESOURCE_ENERGY
        }, this.pid);
      } else {
        return; // Need to deposit somewhere... a container?
      }
    } else {
      if (creep.room.name != this.memory.targetRoom) {
        return this.MoveToRoom(creep, this.memory.targetRoom);
      }
      // Go get energy
      return this.GoGetEnergy(creep);
    }
  }

  protected HandleNoActivity() { }

  GoGetEnergy(creep: Creep) {
    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    for (let i = 0; i < roomData.resources.length; i++) {
      const resource = Game.getObjectById<Resource>(roomData.resources[i]);
      if (!resource || resource.amount < creep.store.getFreeCapacity()) continue;

      return this.creepManager.CreateNewCreepActivity({
        action: AT_Pickup,
        creepID: creep.name,
        targetID: resource.id
      }, this.pid);
    }

    let bestDist = 1000;
    let bestTarget = undefined;
    for (let i = 0; i < roomData.structures[STRUCTURE_CONTAINER].length; i++) {
      const container = Game.getObjectById<StructureContainer>(roomData.structures[STRUCTURE_CONTAINER][i]);
      if (container) {
        if (container.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity()) {
          const dist = container.pos.getRangeTo(creep);
          if (dist < bestDist) {
            bestDist = dist;
            bestTarget = container.id;
          }
        }
      }
    }

    if (bestTarget) {
      return this.creepManager.CreateNewCreepActivity({
        action: AT_Withdraw,
        creepID: creep.name,
        targetID: bestTarget
      }, this.pid);
    } else {
      return;
    }
  }
}
