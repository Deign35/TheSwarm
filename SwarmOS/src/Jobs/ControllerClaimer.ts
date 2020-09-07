export const OSPackage: IPackage = {
  install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
    processRegistry.register(CPKG_ControllerClaimer, ControllerClaimer);
  }
}
import { SoloJob } from "./SoloJob";

class ControllerClaimer extends SoloJob<ControllerClaimer_Memory, MemCache> {
  @extensionInterface(EXT_MapManager)
  mapManager!: IMapManagerExtensions;
  protected GetNewSpawnID(): string | undefined {
    const room = Game.rooms[this.memory.targetRoom];
    if (!this.memory.onlyReserve && room && room.controller && room.controller.my) {
      this.log.info(`Room has already been claimed`);
      this.EndProcess();
      return;
    }

    return this.spawnManager.requestSpawn({
      body: this.memory.onlyReserve ? [CLAIM, CLAIM, MOVE, MOVE] : [CLAIM, MOVE],
      creepName: this.memory.targetRoom + '_' + (Game.time + '_CL').slice(-6),
      owner_pid: this.pid
    }, this.memory.targetRoom, Priority_Lowest, {
        parentPID: this.pid
      }, this.memory.onlyReserve ? 3 : 10);
  }

  protected CreateCustomCreepActivity(creep: Creep): PID | undefined {
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
        this.log.error(`Couldn't find path to exit: ${creep.room.name}`);
        return;
      }
      return this.creepManager.CreateNewCreepActivity({
        action: AT_MoveToPosition,
        creepID: creep.name,
        pos: exit,
        amount: 0
      }, this.pid);
    }

    if (creep.room.controller) {
      if (!creep.room.controller.sign || creep.room.controller.sign.text != MY_SIGNATURE) {
        return this.creepManager.CreateNewCreepActivity({
          action: AT_SignController,
          creepID: creep.name,
          targetID: creep.room.controller.id,
          message: MY_SIGNATURE
        }, this.pid)
      }

      if (!this.memory.onlyReserve && creep.room.controller.my) {
        this.log.info(`Controller already mine: ${creep.room.name}`);
        return;
      }

      return this.creepManager.CreateNewCreepActivity({
        action: this.memory.onlyReserve ? AT_ReserveController : AT_ClaimController,
        creepID: creep.name,
        targetID: creep.room.controller.id
      }, this.pid)
    }

    this.log.info(`Controller doesn't exist: ${creep.room.name}`)
    return;
  }
  protected HandleNoActivity() { }
}