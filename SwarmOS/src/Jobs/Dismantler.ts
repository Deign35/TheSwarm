export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_Dismantler, Dismantler);
  }
}
import { SoloJob } from "./SoloJob";

class Dismantler extends SoloJob<Dismantler_Memory, MemCache> {
  protected GetNewSpawnID(): string {
    return this.spawnManager.requestSpawn({
      body: [WORK, WORK, MOVE, MOVE],
      creepName: this.memory.homeRoom + "_" + (Game.time + '_Di').slice(-6),
      owner_pid: this.pid
    }, this.memory.homeRoom, Priority_Lowest, {
        parentPID: this.pid
      }, 0);
  }
  protected CreateCustomCreepActivity(creep: Creep): string | undefined {
    if (creep.room.name != this.memory.targetRoom) {
      return this.MoveToRoom(creep, this.memory.targetRoom);
    }

    const structures = creep.room.find(FIND_STRUCTURES);
    let target = undefined;
    let distToTarget = 100000;
    for (let i = 0; i < structures.length; i++) {
      if (structures[i].structureType == STRUCTURE_CONTROLLER) { continue; }
      const dist = structures[i].pos.getRangeTo(creep.pos);
      if (dist < distToTarget) {
        target = structures[i];
        distToTarget = dist;
      }
    }

    if (target) {
      return this.creepManager.CreateNewCreepActivity({
        action: AT_Dismantle,
        creepID: creep.name,
        targetID: target.id,
        exemptedFailures: [ERR_FULL]
      }, this.pid);
    } else {
      return this.creepManager.CreateNewCreepActivity({
        action: AT_Suicide,
        creepID: creep.name,
        pos: creep.pos
      }, this.pid);
    }
  }

  HandleNoActivity(creep: Creep) { }
}