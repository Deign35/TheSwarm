export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_RoomBooter, RoomBooter);
  }
}
import { SoloCreep } from "./SoloCreep";

class RoomBooter extends SoloCreep<RoomBooter_Memory, SoloCreep_Cache> {
  protected RequestBoost(creep: Creep): boolean {
    return false;
  }
  protected GetNewSpawnID(): string | undefined {
    const homeRoom = Game.rooms[this.memory.homeRoom];
    const energyCapacity = (this.memory.homeRoom == this.memory.targetRoom) ? homeRoom.energyAvailable : homeRoom.energyCapacityAvailable;
    let body = [WORK, CARRY, CARRY, MOVE, MOVE];
    if (energyCapacity >= 1100) {
      body = [WORK, WORK, WORK, WORK,
        CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE,
        MOVE, MOVE]
    } else if (energyCapacity >= 550) {
      body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    }
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.targetRoom + '_' + (Game.time + '_RB').slice(-6),
      owner_pid: this.pid
    }, this.memory.homeRoom, (this.memory.homeRoom == this.memory.targetRoom ? Priority_EMERGENCY : Priority_Lowest), {
        parentPID: this.pid
      }, 0);
  }
  protected CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined {
    if (creep.room.name != this.memory.targetRoom) {
      return this.MoveToRoom(creep, this.memory.targetRoom);
    }
    const carryRatio = creep.store.getUsedCapacity() / creep.store.getCapacity();
    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    if (carryRatio > 0.50) {
      const depositTargets = roomData.structures[STRUCTURE_EXTENSION].concat(roomData.structures[STRUCTURE_SPAWN]);
      let bestDist = 100000;
      let bestTarget: ObjectID | undefined = undefined;
      for (let i = 0; i < depositTargets.length; i++) {
        const target = Game.getObjectById<StructureExtension | StructureSpawn>(depositTargets[i]);
        if (!target || (this.cache.lastAction && depositTargets[i] == this.cache.lastAction.targetID)) { continue; }
        if (target.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          const dist = target.pos.getRangeTo(creep);
          if (dist < bestDist) {
            bestDist = dist;
            bestTarget = depositTargets[i];
          }
        }
      }

      if (bestTarget) {
        return {
          action: AT_Transfer,
          targetID: bestTarget,
          resourceType: RESOURCE_ENERGY,
        }
      }
      const constructionSites = Game.rooms[creep.room.name].find(FIND_CONSTRUCTION_SITES);
      for (let i = 0, length = constructionSites.length; i < length; i++) {
        if (constructionSites[i].structureType == STRUCTURE_SPAWN) {
          return {
            action: AT_Build,
            targetID: constructionSites[i].id,
            distance: 3
          }
        }
      }

      if (constructionSites.length > 0) {
        return {
          action: AT_Build,
          targetID: constructionSites[0].id,
          distance: 3
        }
      }

      return {
        action: AT_Upgrade,
        targetID: creep.room.controller!.id,
        distance: 3
      }
    }

    const sources = creep.room.find(FIND_SOURCES_ACTIVE);
    if (sources.length > 0) {
      let closestDist = sources[0].pos.getRangeTo(creep.pos);
      let closestIndex = 0;
      for (let i = 1; i < sources.length; i++) {
        const dist = sources[i].pos.getRangeTo(creep.pos);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      }
      return {
        action: AT_Harvest,
        targetID: sources[closestIndex].id
      }
    }

    this.log.info(`Couldn't find anything to do`);
    return;
  }

  HandleNoActivity(creep: Creep) { }
}