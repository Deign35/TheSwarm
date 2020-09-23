export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_MineralHarvester, MineralHarvester);
  }
}

import { SquadJob } from "./SquadJob";

class MineralHarvester extends SquadJob<MineralHarvester_Memory, MemCache> {
  CreateSpawnActivity(squadID: number) {
    const roomData = this.roomManager.GetRoomData(this.memory.roomID)!;
    const mineral = Game.getObjectById<Mineral>(roomData.mineralIDs[0])!;
    if (mineral.ticksToRegeneration > 0) {
      this.sleeper.sleep(this.pid, mineral.ticksToRegeneration);
      return;
    }
    super.CreateSpawnActivity(squadID);
  }
  protected GetNewSpawnID(squadID: number): string {
    if (squadID == 0) {
      const body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE];
      return this.spawnManager.requestSpawn({
        body: body,
        creepName: this.memory.roomID + "_" + (Game.time + '_HM').slice(-6),
        owner_pid: this.pid
      }, this.memory.roomID, Priority_Medium, {
          parentPID: this.pid
        }, 0);
    } else if (squadID == 1) {
      const body = [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
      return this.spawnManager.requestSpawn({
        body: body,
        creepName: this.memory.roomID + "_" + (Game.time + '_HMR').slice(-7),
        owner_pid: this.pid
      }, this.memory.roomID, Priority_Low, {
          parentPID: this.pid
        }, 0)
    } else {
      throw new Error("Squad has too many units");
    }
  }
  protected CreateCustomCreepActivity(squadID: number, creep: Creep): string | undefined {
    const roomData = this.roomManager.GetRoomData(this.memory.roomID)!;
    const mineral = Game.getObjectById<Mineral>(roomData.mineralIDs[0])!;
    if (!this.memory.container) {
      const container = mineral.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: (struct) => {
          return struct.structureType == STRUCTURE_CONTAINER;
        }
      });

      if (container && container.pos.getRangeTo(mineral) == 1) {
        this.memory.container = container.id;
      }
    }

    if (squadID == 0) {
      if (mineral.pos.getRangeTo(creep.pos) > 1) {
        let targetPos = mineral.pos;
        let dist = 1;
        if (this.memory.container) {
          let container = Game.getObjectById<StructureContainer>(this.memory.container);
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

      if (roomData.structures[STRUCTURE_EXTRACTOR].length > 0) {
        return this.creepManager.CreateNewCreepActivity({
          action: AT_Harvest,
          creepID: creep.name,
          targetID: mineral.id
        }, this.pid);
      }
    } else if (squadID == 1) {
      if (creep.ticksToLive && creep.ticksToLive < 50 && creep.store.getUsedCapacity() == 0) {
        return this.creepManager.CreateNewCreepActivity({
          action: AT_Suicide,
          creepID: creep.name,
          pos: creep.pos
        }, this.pid);
      }
      if (creep.store.getUsedCapacity() > creep.store.getFreeCapacity() || (creep.ticksToLive && creep.ticksToLive < 50)) {
        // Deposit to the terminal
        if (roomData.structures[STRUCTURE_TERMINAL].length > 0) {
          const terminal = Game.getObjectById<StructureTerminal>(roomData.structures[STRUCTURE_TERMINAL][0]);
          if (terminal) {
            return this.creepManager.CreateNewCreepActivity({
              action: AT_Transfer,
              creepID: creep.name,
              targetID: terminal.id,
              resourceType: mineral.mineralType
            }, this.pid);
          }
        }
      }
      for (let i = 0; i < roomData.resources.length; i++) {
        const resource = Game.getObjectById<Resource>(roomData.resources[i]);
        if (resource && resource.resourceType == mineral.mineralType) {
          return this.creepManager.CreateNewCreepActivity({
            action: AT_Pickup,
            creepID: creep.name,
            targetID: resource.id
          }, this.pid)
        }
      }

      if (this.memory.container) {
        const container = Game.getObjectById<StructureContainer>(this.memory.container);
        if (container) {
          return this.creepManager.CreateNewCreepActivity({
            action: AT_Withdraw,
            creepID: creep.name,
            resourceType: mineral.mineralType,
            targetID: container.id
          }, this.pid);
        }
      }
    } else {
      throw new Error("Squad has too many units");
    }

    return undefined;
  }

  HandleNoActivity(squadID: number, creep: Creep) { }
}