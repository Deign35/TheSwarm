export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_RemoteRefiller, RemoteRefiller);
  }
}
import { SoloCreep } from "./SoloCreep";

class RemoteRefiller extends SoloCreep<RemoteRefiller_Memory, SoloCreep_Cache> {
  protected RequestBoost(creep: Creep): boolean {
    return false;
  }
  protected GetNewSpawnID(): string {
    const body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.targetRoom + "_" + (Game.time + '_Ref').slice(-8),
      owner_pid: this.pid
    }, this.memory.homeRoom, Priority_Lowest, {
        parentPID: this.pid
      }, 0)
  }

  protected CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined {
    if (creep.store.getUsedCapacity() > creep.store.getFreeCapacity()) {
      if (creep.room.name != this.memory.homeRoom) {
        return this.MoveToRoom(creep, this.memory.homeRoom);
      }

      if (!this.memory.link) {
        const roomData = this.roomManager.GetRoomData(this.memory.homeRoom)!;
        for (let i = 0; i < roomData.structures[STRUCTURE_LINK].length; i++) {
          const link = Game.getObjectById<StructureLink>(roomData.structures[STRUCTURE_LINK][i]);
          if (!link) { continue; }
          if (creep.pos.getRangeTo(link) <= 3) {
            this.memory.link = link.id;
            break;
          }
        }
      }

      if (this.memory.link) {
        const link = Game.getObjectById<StructureLink>(this.memory.link);
        if (link && link.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store[RESOURCE_ENERGY]) {
          return {
            action: AT_Transfer,
            targetID: link.id,
            resourceType: RESOURCE_ENERGY
          }
        }
      }
      if (creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] < 50000) {
        return {
          action: AT_Transfer,
          targetID: creep.room.terminal.id,
          resourceType: RESOURCE_ENERGY
        }
      }
      if (creep.room.storage) {
        return {
          action: AT_Transfer,
          targetID: creep.room.storage.id,
          resourceType: RESOURCE_ENERGY
        }
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

  protected HandleNoActivity(creep: Creep) {
    if (creep.room.name == this.memory.targetRoom) {
      // We're in the room, but can't find anything to do.
      if (creep.pos.x <= 1) {
        creep.move(RIGHT);
      } else if (creep.pos.x >= 48) {
        creep.move(LEFT);
      } else if (creep.pos.y <= 1) {
        creep.move(BOTTOM);
      } else if (creep.pos.y >= 48) {
        creep.move(TOP);
      }
    }
  }

  GoGetEnergy(creep: Creep): SoloCreepAction | undefined {
    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    for (let i = 0; i < roomData.resources.length; i++) {
      const resource = Game.getObjectById<Resource>(roomData.resources[i]);
      if (!resource || resource.amount < creep.store.getFreeCapacity()) continue;

      return {
        action: AT_Pickup,
        targetID: resource.id
      }
    }

    for (let i = 0; i < roomData.tombstones.length; i++) {
      const tombstone = Game.getObjectById<Tombstone>(roomData.tombstones[i]);
      if (!tombstone || tombstone.store.getUsedCapacity(RESOURCE_ENERGY) < (creep.store.getFreeCapacity() / 2)) {
        continue;
      }

      return {
        action: AT_Withdraw,
        targetID: tombstone.id,
        resourceType: RESOURCE_ENERGY
      }
    }

    let bestDist = 1000;
    let bestTarget = undefined;
    for (let i = 0; i < roomData.structures[STRUCTURE_CONTAINER].length; i++) {
      const container = Game.getObjectById<StructureContainer>(roomData.structures[STRUCTURE_CONTAINER][i]);
      if (container) {
        if (container.store[RESOURCE_ENERGY] >= creep.store.getFreeCapacity()) {
          const dist = container.pos.getRangeTo(creep);
          if (dist < bestDist) {
            bestDist = dist;
            bestTarget = container.id;
          }
        }
      }
    }

    if (bestTarget) {
      return {
        action: AT_Withdraw,
        targetID: bestTarget,
        resourceType: RESOURCE_ENERGY
      }
    } else {
      return;
    }
  }
}
