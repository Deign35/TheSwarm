export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_RoomBooter, RoomBooter);
  }
}
import { SoloJob } from "./SoloJob";

class RoomBooter extends SoloJob<RoomBooter_Memory, MemCache> {
  @extensionInterface(EXT_MapManager)
  mapManager!: IMapManagerExtensions;
  protected GetNewSpawnID(): string | undefined {
    const targetRoom = Game.rooms[this.memory.targetRoom];
    if (targetRoom) {
      const structures = targetRoom.find(FIND_MY_SPAWNS);
      if (structures.length > 0) {
        this.log.info(`Closing down RoomBooter, ${this.memory.targetRoom} has a spawn now`);
        this.EndProcess();
        return;
      }
    }

    const homeRoom = Game.rooms[this.memory.homeRoom];
    const energyCapacity = homeRoom.energyCapacityAvailable;
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
    }, this.memory.homeRoom, Priority_Lowest, {
        parentPID: this.pid
      }, 0);
  }
  protected CreateCustomCreepActivity(creep: Creep): string | undefined {
    if (creep.room.name != this.memory.targetRoom) {
      return this.MoveToRoom(creep, this.memory.targetRoom);
    }
    const carryRatio = creep.store.getUsedCapacity() / creep.store.getCapacity();
    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    if (carryRatio > 0.50) {
      const constructionSites = Game.rooms[creep.room.name].find(FIND_CONSTRUCTION_SITES);
      for (let i = 0, length = constructionSites.length; i < length; i++) {
        if (constructionSites[i].structureType == STRUCTURE_SPAWN) {
          return this.creepManager.CreateNewCreepActivity({
            action: AT_Build,
            creepID: creep.name,
            targetID: constructionSites[i].id
          }, this.pid);
        }
      }

      if (constructionSites.length > 0) {
        return this.creepManager.CreateNewCreepActivity({
          action: AT_Build,
          creepID: creep.name,
          targetID: constructionSites[0].id
        }, this.pid);
      }

      return this.creepManager.CreateNewCreepActivity({
        action: AT_Upgrade,
        creepID: creep.name,
        targetID: roomData.structures[STRUCTURE_CONTROLLER][0]
      }, this.pid)
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
      return this.creepManager.CreateNewCreepActivity({
        action: AT_Harvest,
        creepID: creep.name,
        targetID: sources[closestIndex].id
      }, this.pid)
    }

    this.log.info(`Couldn't find anything to do`);
    return;
  }

  HandleNoActivity(creep: Creep) { }
}