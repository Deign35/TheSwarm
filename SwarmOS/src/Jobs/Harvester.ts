export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Harvester, Harvester);
  }
}
import { SoloJob } from "./SoloJob";
import { LookAtGround } from "Tools/TheFinder";

class Harvester extends SoloJob<HarvesterMemory, MemCache> {
  RunThread(): ThreadState {
    const creep = Game.creeps[this.memory.creepID!];
    if (!this.memory.remoteHarvester && creep && !creep.spawning && creep.ticksToLive! < 80) {
      delete this.memory.creepID;
      delete this.memory.activityPID;
    }
    return super.RunThread();
  }

  protected GetNewSpawnID(): string {
    const homeRoom = Game.rooms[this.memory.homeRoom];
    let body: BodyPartConstant[] = [WORK, WORK, MOVE];
    if (homeRoom.energyCapacityAvailable >= 800) {
      body = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
    } else if (homeRoom.energyCapacityAvailable >= 550) {
      body = [WORK, WORK, WORK, WORK, WORK, MOVE];
    } else {
      const source = Game.getObjectById<Source>(this.memory.source)!;
      let count = 0;

      LookAtGround(this.memory.targetRoom, new RoomPosition(source.pos.x - 1, source.pos.y + 1, this.memory.targetRoom),
        new RoomPosition(source.pos.x + 1, source.pos.y - 1, this.memory.targetRoom), (x, y, terrain) => {
          if (terrain != TERRAIN_MASK_WALL) {
            if (count < 3 && count++ > 0) {
              this.SpawnSupportHarvester();
            }
          }
        });
    }
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.targetRoom + '_H_' + this.memory.source.slice(-1),
      owner_pid: this.pid
    }, this.memory.homeRoom, this.memory.remoteHarvester ? Priority_Medium : Priority_High, {
        parentPID: this.pid
      }, 0);
  }

  protected CreateCustomCreepActivity(creep: Creep): string | undefined {
    if (creep.room.name != this.memory.targetRoom) {
      return this.MoveToRoom(creep, this.memory.targetRoom);
    }
    const source = Game.getObjectById<Source>(this.memory.source)!;
    if (source.pos.getRangeTo(creep.pos) > 1) {
      let targetPos = source.pos;
      let dist = 1;
      if (!this.memory.container) {
        const containerIDs = this.roomManager.GetRoomData(creep.room.name)!.structures[STRUCTURE_CONTAINER];
        for (let i = 0; i < containerIDs.length; i++) {
          const container = Game.getObjectById<StructureContainer>(containerIDs[i]);
          if (container && source.pos.isNearTo(container.pos)) {
            this.memory.container = container.id;
          }
        }
      }
      if (this.memory.container) {
        const container = Game.getObjectById<StructureContainer>(this.memory.container);
        if (container) {
          targetPos = container.pos;
          dist = 0;
        }
      }
      return this.creepManager.CreateNewCreepActivity({
        action: AT_MoveToPosition,
        creepID: creep.name,
        pos: targetPos,
        amount: dist
      }, this.pid);
    }

    const container = Game.getObjectById<StructureContainer | ConstructionSite>(this.memory.container);
    if (creep.store[RESOURCE_ENERGY] > 0) {
      if (container) {
        if ((container as StructureContainer).hitsMax) {
          if (((container as StructureContainer).hits + (REPAIR_POWER * creep.getActiveBodyparts(WORK))) <= (container as StructureContainer).hitsMax) {
            return this.creepManager.CreateNewCreepActivity({
              action: AT_Repair,
              creepID: creep.name,
              targetID: container.id
            }, this.pid)
          }
        } else if ((container as ConstructionSite).progressTotal) {
          return this.creepManager.CreateNewCreepActivity({
            action: AT_Build,
            creepID: creep.name,
            targetID: container.id
          }, this.pid);
        } else {
          delete this.memory.container;
        }
      } else {
        const sites = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
        if (sites && sites.length > 0) {
          if (sites[0].structureType == STRUCTURE_CONTAINER) {
            this.memory.container = sites[0].id;
          }
        } else {
          const structs = creep.pos.lookFor(LOOK_STRUCTURES);
          for (let i = 0; i < structs.length; i++) {
            if (structs[i].structureType == STRUCTURE_CONTAINER) {
              this.memory.container = structs[0].id;
            }
          }
        }
      }
    }

    if (source.energy > 0) {
      if (container && (container as StructureContainer).hitsMax &&
        (container as StructureContainer).hits < (container as StructureContainer).hitsMax) {
        return this.creepManager.CreateNewCreepActivity({
          targetID: source.id,
          action: AT_Harvest,
          creepID: creep.name
        }, this.pid);
      }
      return this.creepManager.CreateNewCreepActivity({
        targetID: source.id,
        action: AT_Harvest,
        creepID: creep.name,
        exemptedFailures: [ERR_FULL]
      }, this.pid);
    }

    return;
  }
  HandleNoActivity(creep: Creep) {
    // Do Nothing;
  }

  SpawnSupportHarvester() {
    const sID = this.spawnManager.requestSpawn({
      body: [WORK, WORK, MOVE],
      creepName: 'SH' + GetRandomIndex(primes_100),
      owner_pid: this.pid
    }, this.memory.homeRoom, Priority_Medium, {
        parentPID: this.pid
      }, 1);

    const newSpawnActivityMem: SpawnActivity_Memory = {
      spawnID: sID,
      HC: 'SupportHarvesterHC'
    }
    const newPID = this.kernel.startProcess(APKG_SpawnActivity, newSpawnActivityMem);
    this.kernel.setParent(newPID, this.pid);
  }

  SupportHarvesterHC(creepID: CreepID) {
    const newMem: RepetitiveCreepActivity_Memory = {
      actions: [{
        action: AT_Harvest,
        exemptedFailures: [ERR_FULL, ERR_NOT_ENOUGH_ENERGY],
        targetID: this.memory.source,
        creepID: creepID
      }],
      creepID: creepID,
    }

    const newPID = this.kernel.startProcess(APKG_RepetitiveCreepActivity, newMem);
    this.kernel.setParent(newPID, this.pid);
  }
}