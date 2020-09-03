export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_ExperimentalSquad, ExperimentalSquad);
  }
}

import { SquadJob } from "./SquadJob";

class ExperimentalSquad extends SquadJob<ExperimentalSquad_Memory> {
  @extensionInterface(EXT_MapManager)
  mapManager!: IMapManagerExtensions;
  RunThread() {
    if (!this.memory.invasion && Game.rooms[this.memory.targetRoom] && Game.time % 5 == 0) {
      const invaders = Game.rooms[this.memory.targetRoom].find(FIND_HOSTILE_CREEPS);
      for (let i = 0; i < invaders.length; i++) {
        if (invaders[i].owner.username == "Invader") {
          this.log.alert(`Invasion detected`);
          this.memory.invasion = invaders[i].ticksToLive!;
        }
      }
    }

    if (this.memory.invasion) {
      this.memory.invasion--;
      if (this.memory.invasion <= 0) {
        delete this.memory.invasion;
      }
    }
    return super.RunThread();
  }

  protected GetNewSpawnID(squadID: number) {
    if (this.memory.invasion > 0) {
      return;
    }
    if (squadID == 0) {
      const body = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE];
      return this.spawnManager.requestSpawn({
        body: body,
        creepName: this.memory.targetRoom + "_" + (Game.time + '_Har').slice(-8),
        owner_pid: this.pid
      }, this.memory.targetRoom, Priority_Low, {
          parentPID: this.pid
        }, 3);
    } else if (squadID == 1 || squadID == 4 || squadID == 5) {
      const body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
      return this.spawnManager.requestSpawn({
        body: body,
        creepName: this.memory.targetRoom + "_" + (Game.time + '_Ref').slice(-8),
        owner_pid: this.pid
      }, this.memory.targetRoom, Priority_Lowest, {
          parentPID: this.pid
        }, 3)
    } else if (squadID == 2) {
      const body = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
      return this.spawnManager.requestSpawn({
        body: body,
        creepName: this.memory.targetRoom + "_" + (Game.time + '_Bui').slice(-8),
        owner_pid: this.pid
      }, this.memory.targetRoom, Priority_Lowest, {
          parentPID: this.pid
        }, 3);
    } else if (squadID == 3) {
      const body = [CLAIM, CLAIM, MOVE, MOVE]
      return this.spawnManager.requestSpawn({
        body: body,
        creepName: this.memory.targetRoom + "_" + (Game.time + '_Cla').slice(-8),
        owner_pid: this.pid
      }, this.memory.targetRoom, Priority_Lowest, {
          parentPID: this.pid
        }, 3)
    } else {
      throw new Error("Squad has too many units");
    }
  }
  protected CreateCustomCreepActivity(squadID: number, creep: Creep): string | undefined {
    if (squadID == 0) {
      if (creep.room.name != this.memory.targetRoom) {
        return this.MoveToRoom(creep, this.memory.targetRoom);
      }
      const source = Game.getObjectById<Source>(this.memory.sourceID)!;
      if (source.pos.getRangeTo(creep.pos) > 1) {
        let targetPos = source.pos;
        let dist = 1;
        if (this.memory.container) {
          let container = Game.getObjectById<StructureContainer | ConstructionSite>(this.memory.container);
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

      if (source.energy > 0) {
        return this.creepManager.CreateNewCreepActivity({
          targetID: source.id,
          action: AT_Harvest,
          creepID: creep.name,
          exemptedFailures: [ERR_FULL]
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

      return;
    } else if (squadID == 1 || squadID == 4 || squadID == 5) {
      if (creep.store.getUsedCapacity() > creep.store.getFreeCapacity()) {
        if (creep.room.name != this.memory.roomID) {
          return this.MoveToRoom(creep, this.memory.roomID);
        }
        if (creep.room.storage) {
          return this.creepManager.CreateNewCreepActivity({
            action: AT_Transfer,
            creepID: creep.name,
            targetID: creep.room.storage.id,
            resourceType: RESOURCE_ENERGY
          }, this.pid);
        }
      } else {
        if (creep.room.name != this.memory.targetRoom) {
          return this.MoveToRoom(creep, this.memory.targetRoom);
        }
        // Go get energy
        return this.GoGetEnergy(creep);
      }
    } else if (squadID == 2) {
      if (creep.room.name != this.memory.targetRoom) {
        return this.MoveToRoom(creep, this.memory.targetRoom);
      }

      if (creep.store.getUsedCapacity() > creep.store.getFreeCapacity()) {
        // Use the energy building or repairing
        const roomData = this.roomManager.GetRoomData(creep.room.name)!;
        for (let i = 0; i < roomData.needsRepair.length; i++) {
          const targetToRepair = Game.getObjectById<Structure>(roomData.needsRepair[i]);
          if (targetToRepair && targetToRepair.hits < targetToRepair.hitsMax) {
            return this.creepManager.CreateNewCreepActivity({
              action: AT_Repair,
              creepID: creep.name,
              targetID: targetToRepair.id
            }, this.pid);
          }
        }

        for (let i = 0; i < roomData.cSites.length; i++) {
          const targetToBuild = Game.getObjectById<ConstructionSite>(roomData.cSites[i]);
          if (targetToBuild) {
            return this.creepManager.CreateNewCreepActivity({
              action: AT_Build,
              creepID: creep.name,
              targetID: targetToBuild.id
            }, this.pid);
          }
        }
      } else {
        // Go get energy
        return this.GoGetEnergy(creep);

      }
    } else if (squadID == 3) {
      if (creep.room.name != this.memory.targetRoom) {
        return this.MoveToRoom(creep, this.memory.targetRoom);
      }

      if (creep.room.controller) {
        return this.creepManager.CreateNewCreepActivity({
          action: AT_ReserveController,
          creepID: creep.name,
          targetID: creep.room.controller.id
        }, this.pid)
      }
    } else {
      throw new Error("Squad has too many units");
    }

    return undefined;
  }

  HandleNoActivity() { }

  MoveToRoom(creep: Creep, targetRoom: RoomID) {
    // TODO: Cache findRoute to the global cache.
    const route = this.mapManager.GetRoute(creep.room.name, targetRoom);
    //const route = Game.map.findRoute(creep.room.name, targetRoom);
    if (route == -2) { return; }
    let exit = null;
    for (let i = 0; i < route.length; i++) {
      exit = creep.pos.findClosestByPath(route[i].exit);
    }
    if (!exit) { return; }
    return this.creepManager.CreateNewCreepActivity({
      action: AT_MoveToPosition,
      creepID: creep.name,
      pos: exit,
      amount: 0
    }, this.pid);
  }

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

    const container = Game.getObjectById<StructureContainer>(this.memory.container);
    if (!container) return undefined;

    return this.creepManager.CreateNewCreepActivity({
      action: AT_Withdraw,
      creepID: creep.name,
      targetID: container.id
    }, this.pid);
  }
}