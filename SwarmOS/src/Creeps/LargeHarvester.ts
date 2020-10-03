export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_LargeHarvester, LargetHarvester);
  }
}
import { SoloCreep } from "./SoloCreep";
import { LookAtGround } from "Tools/TheFinder";

class LargetHarvester extends SoloCreep<LargeHarvester_Memory, LargeHarvester_Cache> {
  protected RequestBoost(creep: Creep): boolean {
    return false;
  }
  protected GetNewSpawnID(): string {
    let body: BodyPartConstant[] = [WORK, WORK, WORK, WORK, WORK, WORK,
      WORK, WORK, WORK, WORK, WORK, WORK,
      CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    if (this.memory.remoteHarvester) {
      body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
      MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    }
    const targetRoom = Game.rooms[this.memory.targetRoom];
    if (targetRoom) {
      const sources = targetRoom.find(FIND_SOURCES);
      if (sources.length == 2) {
        const path = targetRoom.findPath(sources[0].pos, sources[1].pos);
        if (path.length > 24) {
          body.unshift(WORK);
          body.push(MOVE);
        }
      }
    }
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.targetRoom + "_" + (Game.time + "_LH").slice(-6),
      owner_pid: this.pid
    }, this.memory.homeRoom, this.memory.remoteHarvester ? Priority_Medium : Priority_High, {
        parentPID: this.pid
      }, 0);
  }

  protected CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined {
    if (!this.cache.curSource) {
      const closestSource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
      if (closestSource) {
        this.cache.curSource = closestSource.id;
      }
    }

    let source = Game.getObjectById<Source>(this.cache.curSource!);
    if (source && source.energy <= 0) {
      const closestSource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
      if (closestSource) {
        this.cache.curSource = closestSource.id;
        delete this.cache.curContainer;
        delete this.cache.curLink;
        source = closestSource;
      } else {
        const roomData = this.roomManager.GetRoomData(creep.room.name)!;
        let refreshTimer = 3000;
        let targetSource = undefined;
        for (let i = 0; i < roomData.sourceIDs.length; i++) {
          const source = Game.getObjectById<Source>(roomData.sourceIDs[i])!;
          if (source.ticksToRegeneration && source.ticksToRegeneration < refreshTimer) {
            refreshTimer = source.ticksToRegeneration;
            targetSource = source.id;
          }
        }
        
        if (!targetSource) { return; }
        return {
          action: AT_MoveToPosition,
          distance: 3,
          targetID: targetSource
        }
      }
    }

    if (!source) {
      if (creep.room.name != this.memory.targetRoom) {
        return this.MoveToRoom(creep, this.memory.targetRoom);
      }

      return {
        action: AT_NoOp,
      };
    }

    if (source.pos.getRangeTo(creep.pos) > 1) {
      let targetPos = source.pos;
      let dist = 1;
      if (!this.cache.curContainer) {
        const containerIDs = this.roomManager.GetRoomData(source.room.name)!.structures[STRUCTURE_CONTAINER];
        for (let i = 0; i < containerIDs.length; i++) {
          const container = Game.getObjectById<StructureContainer>(containerIDs[i]);
          if (container && source.pos.isNearTo(container.pos)) {
            this.cache.curContainer = container.id;
          }
        }
      }
      if (this.cache.curContainer) {
        const container = Game.getObjectById<StructureContainer>(this.cache.curContainer);
        if (container) {
          targetPos = container.pos;
          dist = 0;
        }
      }

      return {
        action: AT_MoveToPosition,
        distance: dist,
        pos: targetPos
      };
    }

    if (creep.store[RESOURCE_ENERGY] > 0) {
      if (!this.cache.curContainer) {        
        const sites = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES);
        if (sites && sites.length > 0) {
          if (sites[0].structureType == STRUCTURE_CONTAINER) {
            this.cache.curContainer = sites[0].id;
          }
        } else {
          const structs = creep.pos.lookFor(LOOK_STRUCTURES);
          for (let i = 0; i < structs.length; i++) {
            if (structs[i].structureType == STRUCTURE_CONTAINER) {
              this.cache.curContainer = structs[0].id;
            }
          }
        }
      }
      const container = Game.getObjectById<StructureContainer | ConstructionSite>(this.cache.curContainer!);
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
          delete this.cache.curContainer;
        }
      }

      if (!this.cache.curLink) {
        const roomData = this.roomManager.GetRoomData(creep.room.name)!;
        const linkIDs = roomData.structures[STRUCTURE_LINK];
        for (let i = 0; i < linkIDs.length; i++) {
          const link = Game.getObjectById<StructureLink>(linkIDs[i]);
          if (!link) { continue; }
          if (link.pos.isNearTo(creep)) {
            this.cache.curLink = link.id;
            break;
          }
        }
      }

      if (this.cache.curLink && !this.cache.lastAction) {
        const link = Game.getObjectById<StructureLink>(this.cache.curLink);
        if (!link) {
          delete this.cache.curLink
        } else if (link.store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store[RESOURCE_ENERGY]) {
          return {
            action: AT_Transfer,
            targetID: link.id,
            resourceType: RESOURCE_ENERGY
          }
        }
      }
    }

    return {
      targetID: source.id,
      action: AT_Harvest,
    }
  }
  HandleNoActivity(creep: Creep) {
    // Do Nothing;
  }
  OnTick(creep?: Creep) {
    if (!this.memory.isZombie && creep && creep.ticksToLive) {
      if ((this.memory.remoteHarvester && creep.ticksToLive < 200) ||
      creep.ticksToLive < 120) {
        const newPID = this.kernel.startProcess(this.pkgName, {
          homeRoom: this.memory.homeRoom,
          targetRoom: this.memory.targetRoom,
          creepID: this.memory.creepID,
          hasRun: true,
          isZombie: true,
          remoteHarvester: this.memory.remoteHarvester,
        } as LargeHarvester_Memory);

        this.creepManager.releaseCreep(this.memory.creepID!, this.pid);
        this.creepManager.tryReserveCreep(this.memory.creepID!, newPID);
        this.EndProcess();
      }
    }
  }
}