export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_MineralHarvester, MineralHarvester);
  }
}
import { SoloCreep } from "./SoloCreep";

class MineralHarvester extends SoloCreep<MineralHarvester_Memory, SoloCreep_Cache> {
  protected RequestBoost(creep: Creep): boolean {
    return false;
  }
  protected GetNewSpawnID(): string | undefined {
    let body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
      MOVE, MOVE, MOVE, MOVE, MOVE];
    return this.spawnManager.requestSpawn({
      body: body,
      creepName: this.memory.targetRoom + '_' + (Game.time + '_MH').slice(-6),
      owner_pid: this.pid
    }, this.memory.homeRoom, Priority_Low, {
        parentPID: this.pid
      }, 0);
  }

  protected CreateCustomCreepAction(creep: Creep): SoloCreepAction | undefined  {
    if (creep.room.name != this.memory.targetRoom) {
      return this.MoveToRoom(creep, this.memory.targetRoom);
    }

    const roomData = this.roomManager.GetRoomData(creep.room.name)!;
    const mineral = Game.getObjectById<Mineral>(roomData.mineralIDs[0])!;

    if (!creep.pos.isNearTo(mineral)) {
      for (let i = 0; i < roomData.structures[STRUCTURE_CONTAINER].length; i++) {
        const container = Game.getObjectById<StructureContainer>(roomData.structures[STRUCTURE_CONTAINER][i]);
        if (!container) { continue; }

        if (container.pos.isNearTo(mineral)) {
          return {
            action: AT_MoveToPosition,
            distance: 0,
            pos: container.pos
          }
        }
      }
    } else {
      return {
        action: AT_Harvest,
        targetID: mineral.id
      }
    }

    return;
  }
  protected HandleNoActivity(creep: Creep) { }
}