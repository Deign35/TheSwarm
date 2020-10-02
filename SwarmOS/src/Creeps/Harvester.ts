export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Harvester, Harvester);
  }
}
import { SoloCreep } from "./SoloCreep";
import { LookAtGround } from "Tools/TheFinder";

class Harvester extends SoloCreep<HarvesterMemory, SoloCreep_Cache> {
  protected RequestBoost(creep: Creep): boolean {
    return false;
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
      if (!this.memory.supportHarvester) {
        let count = 0;

        LookAtGround(this.memory.targetRoom, new RoomPosition(source.pos.x - 1, source.pos.y + 1, this.memory.targetRoom),
          new RoomPosition(source.pos.x + 1, source.pos.y - 1, this.memory.targetRoom), (x, y, terrain) => {
            if (terrain != TERRAIN_MASK_WALL) {
              if (count < 3 && count++ > 0) {
                this.kernel.startProcess(this.pkgName, {
                  homeRoom: this.memory.homeRoom,
                  targetRoom: this.memory.targetRoom,
                  expires: true,
                  source: this.memory.source,
                  supportHarvester: true
                } as HarvesterMemory);
              }
            }
          });
      }
    }
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.targetRoom + '_H_' + this.memory.source.slice(-1),
      owner_pid: this.pid
    }, this.memory.homeRoom, this.memory.remoteHarvester ? Priority_Medium : Priority_High, {
        parentPID: this.pid
      }, 0);
  }

  protected CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined {
    const source = Game.getObjectById<Source>(this.memory.source);
    if (!source) {
      if (creep.room.name != this.memory.targetRoom) {
        return this.MoveToRoom(creep, this.memory.targetRoom);
      }

      this.log.error(`Harvester(${creep.name}) couldn't find target source(${this.memory.source})`);
      return {
        action: AT_NoOp,
      };
    }

    if (source.pos.getRangeTo(creep.pos) > 1) {
      let targetPos = source.pos;
      let dist = 1;
      if (!this.memory.supportHarvester) {
        if (!this.memory.container) {
          const containerIDs = this.roomManager.GetRoomData(source.room.name)!.structures[STRUCTURE_CONTAINER];
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
      }

      return {
        action: AT_MoveToPosition,
        distance: dist,
        pos: targetPos
      };
    }

    const container = Game.getObjectById<StructureContainer | ConstructionSite>(this.memory.container);
    if (creep.store[RESOURCE_ENERGY] > 0 && !this.cache.lastAction) {
      if (container) {
        if ((container as StructureContainer).hitsMax) {
          if ((container as StructureContainer).hits < (container as StructureContainer).hitsMax) {
            return {
              action: AT_Repair,
              targetID: container.id
            }
          }
        } else if ((container as ConstructionSite).progressTotal) {
          return {
            action: AT_Build,
            targetID: container.id
          }
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

      if (!this.memory.link) {
        const roomData = this.roomManager.GetRoomData(creep.room.name)!;
        const linkIDs = roomData.structures[STRUCTURE_LINK];
        for (let i = 0; i < linkIDs.length; i++) {
          const link = Game.getObjectById<StructureLink>(linkIDs[i]);
          if (!link) { continue; }
          if (link.pos.isNearTo(creep)) {
            this.memory.link = link.id;
            break;
          }
        }
      }

      if (this.memory.link && !this.cache.lastAction) {
        const link = Game.getObjectById<StructureLink>(this.memory.link);
        if (!link) {
          delete this.memory.link
        } else if (link.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store[RESOURCE_ENERGY]) {
          return {
            action: AT_Transfer,
            targetID: link.id,
            resourceType: RESOURCE_ENERGY
          }
        }
      }
    }

    if (source.energy > 0) {
      if (container && !this.memory.link && (container as StructureContainer).hitsMax &&
        (container as StructureContainer).hits < (container as StructureContainer).hitsMax) {
        return {
          targetID: source.id,
          action: AT_Harvest,
        }
      }
      return {
        targetID: source.id,
        action: AT_Harvest,
        exemptedFailures: [ERR_FULL]
      }
    }

    return;
  }
  HandleNoActivity(creep: Creep) {
    // Do Nothing;
  }
  OnTick(creep?: Creep) {
    if (!this.memory.isZombie && !this.memory.supportHarvester && creep && creep.ticksToLive) {
      if ((this.memory.remoteHarvester && creep.ticksToLive < 150) ||
      creep.ticksToLive < 50) {
        const newPID = this.kernel.startProcess(this.pkgName, {
          container: this.memory.container,
          homeRoom: this.memory.homeRoom,
          source: this.memory.source,
          targetRoom: this.memory.targetRoom,
          creepID: this.memory.creepID,
          expires: true,
          hasRun: true,
          isZombie: true,
          link: this.memory.link,
          remoteHarvester: this.memory.remoteHarvester,
        } as HarvesterMemory);

        this.creepManager.releaseCreep(this.memory.creepID!, this.pid);
        this.creepManager.tryReserveCreep(this.memory.creepID!, newPID);
        this.EndProcess();
      }
    }
  }
}