export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_RoomBooter, RoomBooter);
  }
}
import { SoloJob } from "./SoloJob";

class RoomBooter extends SoloJob<RoomBooter_Memory> {
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
      creepName: this.memory.targetRoom + '_' + (Game.time + '_RB').slice(-6),
      owner_pid: this.pid
    }, this.memory.targetRoom, Priority_Lowest, {
        parentPID: this.pid
      }, 10);
  }
  protected CreateCustomCreepActivity(creep: Creep): string | undefined {
    if (creep.room.name != this.memory.targetRoom) {
      const route = this.mapManager.GetRoute(creep.room.name, this.memory.targetRoom);
      if (route == -2) {
        this.log.error(`Couldn't find a path to ${this.memory.targetRoom}`)
        this.EndProcess();
        return;
      }

      let exit = null;
      if (route.length > 0) {
        exit = creep.pos.findClosestByPath(route[0].exit);
      }
      if (!exit) {
        this.log.error(`Couldn't find a path out of the room ${creep.room.name}`);
        return;
      }
      return this.creepManager.CreateNewCreepActivity({
        action: AT_MoveToPosition,
        creepID: creep.name,
        pos: exit,
        amount: 0
      }, this.pid);
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
      return this.creepManager.CreateNewCreepActivity({
        action: AT_Harvest,
        creepID: creep.name,
        targetID: sources[0].id
      }, this.pid)
    }

    this.log.info(`Couldn't find anything to do`);
    return;
  }

  HandleNoActivity() { }
}