export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Harvester, Harvester);
  }
}
import { SoloJob } from "./SoloJob";
import { LookAtGround } from "Tools/TheFinder";

class Harvester extends SoloJob<HarvesterMemory> {
  RunThread(): ThreadState {
    let creep = Game.creeps[this.memory.creepID!];
    if (creep && !creep.spawning && creep.ticksToLive! < 80) {
      delete this.memory.creepID;
      delete this.memory.activityPID;
    }
    return super.RunThread();
  }

  protected GetNewSpawnID(): string {
    let targetRoom = Game.rooms[this.memory.targetRoom];
    let spawnLevel = 0; // (TODO): Update this value based on if targetRoom is reserved
    if (targetRoom.energyCapacityAvailable >= 800) {
      spawnLevel = 2;
    } else if (targetRoom.energyCapacityAvailable >= 550) {
      spawnLevel = 1;
    } else {
      let source = Game.getObjectById(this.memory.source)! as Source;
      let count = 0;

      LookAtGround(targetRoom.id, new RoomPosition(source.pos.x - 1, source.pos.y + 1, targetRoom.name),
        new RoomPosition(source.pos.x + 1, source.pos.y - 1, targetRoom.name), (x, y, terrain) => {
          if (terrain != TERRAIN_MASK_WALL) {
            if (count++ > 0) {
              this.SpawnSupportHarvester();
            }
          }
        });
    }
    return this.spawnManager.requestSpawn({
      body: spawnLevel == 2 ? [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE] :
        spawnLevel == 1 ? [WORK, WORK, WORK, WORK, WORK, MOVE] :
          [WORK, WORK, MOVE],
      creepName: this.memory.targetRoom + '_H_' + this.memory.source.slice(-1),
      owner_pid: this.pid
    }, this.memory.targetRoom, Priority_High, {
        parentPID: this.pid
      }, 3);
  }

  protected CreateCustomCreepActivity(creep: Creep): string | undefined {
    let source = Game.getObjectById<Source>(this.memory.source)!;
    if (source.pos.getRangeTo(creep.pos) > 1) {
      return this.creepManager.CreateNewCreepActivity({
        action: AT_MoveToPosition,
        creepID: creep.name,
        pos: source.pos,
        amount: 1
      }, this.pid);
    }

    if (source.energy > 0) {
      return this.creepManager.CreateNewCreepActivity({
        targetID: source.id,
        action: AT_Harvest,
        creepID: creep.name,
        exemptedFailures: [ERR_FULL]
      }, this.pid);
    }
    let container = Game.getObjectById<StructureContainer | ConstructionSite>(this.memory.container);
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
        let sites = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
        if (sites && sites.length > 0) {
          if (sites[0].structureType == STRUCTURE_CONTAINER) {
            this.memory.container = sites[0].id;
          }
        } else {
          let structs = creep.pos.lookFor(LOOK_STRUCTURES);
          for (let i = 0; i < structs.length; i++) {
            if (structs[i].structureType == STRUCTURE_CONTAINER) {
              this.memory.container = sites[0].id;
            }
          }
        }
      }
    }

    return;
  }
  HandleNoActivity() {
    // Do Nothing;
  }

  SpawnSupportHarvester() {
    let sID = this.spawnManager.requestSpawn({
      body: [WORK, WORK, MOVE],
      creepName: 'SH' + GetRandomIndex(primes_100),
      owner_pid: this.pid
    }, this.memory.roomID, Priority_Medium, {
        parentPID: this.pid
      }, 1);

    let newSpawnActivityMem: SpawnActivity_Memory = {
      spawnID: sID,
      HC: 'SupportHarvesterHC'
    }
    let newPID = this.kernel.startProcess(APKG_SpawnActivity, newSpawnActivityMem);
    this.kernel.setParent(newPID, this.pid);
  }

  SupportHarvesterHC(creepID: CreepID) {
    let newMem: RepetitiveCreepActivity_Memory = {
      actions: [{
        action: AT_Harvest,
        exemptedFailures: [ERR_FULL, ERR_NOT_ENOUGH_ENERGY],
        targetID: this.memory.source,
        creepID: creepID
      }],
      creepID: creepID,
    }

    let newPID = this.kernel.startProcess(APKG_RepetitiveCreepActivity, newMem);
    this.kernel.setParent(newPID, this.pid);
  }
}