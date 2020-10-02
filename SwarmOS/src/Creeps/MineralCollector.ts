export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_MineralCollector, MineralCollector);
  }
}
import { SoloCreep } from "./SoloCreep";

class MineralCollector extends SoloCreep<MineralCollector_Memory, MineralCollector_Cache> {
  protected RequestBoost(creep: Creep): boolean {
    return false;
  }
  protected GetNewSpawnID(): string | undefined {
    let body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.targetRoom + '_' + (Game.time + '_MC').slice(-6),
      owner_pid: this.pid
    }, this.memory.homeRoom, Priority_Lowest, {
        parentPID: this.pid
      }, 0);
  }

  protected CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined  {
    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    const mineral = Game.getObjectById<Mineral>(roomData.mineralIDs[0])!;
    if (creep.store.getUsedCapacity() < creep.store.getFreeCapacity()) {
      if (creep.room.name != this.memory.targetRoom) {
        return this.MoveToRoom(creep, this.memory.targetRoom);
      }

      if (!this.cache.container) {
        for (let i = 0; i < roomData.structures[STRUCTURE_CONTAINER].length; i++) {
          const container = Game.getObjectById<StructureContainer>(roomData.structures[STRUCTURE_CONTAINER][i]);
          if (!container) { continue; }

          if (container.pos.isNearTo(mineral)) {
            this.cache.container = container.id;
          }
        }
      }

      if (this.cache.container) {
        const container = Game.getObjectById<StructureContainer>(this.cache.container);
        if (!container) {
          delete this.cache.container;
          return {
            action: AT_NoOp,
          }
        }

        return {
          action: AT_Withdraw,
          targetID: container.id,
          resourceType: mineral.mineralType
        }
      }
      
      for (let i = 0; i < roomData.resources.length; i++) {
        const resource = Game.getObjectById<Resource>(roomData.resources[i]);
        if (!resource) { continue; }

        if (resource.resourceType != RESOURCE_ENERGY) {
          return {
            action: AT_Pickup,
            targetID: resource.id
          }
        }
      }
    } else {
      if (creep.room.name != this.memory.homeRoom) {
        return this.MoveToRoom(creep, this.memory.homeRoom);
      }

      const terminal = creep.room.terminal;
      if (terminal) {
        return {
          action: AT_Transfer,
          targetID: terminal.id,
          resourceType: mineral.mineralType
        }
      }
      const storage = creep.room.storage;
      if (storage) {
        return {
          action: AT_Transfer,
          targetID: storage.id,
          resourceType: mineral.mineralType
        }
      }
    }

    return;
  }

  OnTick(creep?: Creep) {
    if (creep && creep.ticksToLive && creep.ticksToLive < 60 && creep.store.getUsedCapacity() == 0) {
      creep.suicide();
    }
  }
  protected HandleNoActivity(creep: Creep) { }
}