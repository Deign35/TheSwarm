import { BasicProcess } from "Core/BasicTypes";

export abstract class SoloJob<T extends SoloJob_Memory, U extends MemCache> extends BasicProcess<T, U> {
  @extensionInterface(EXT_CreepManager)
  creepManager!: ICreepManagerExtensions;
  @extensionInterface(EXT_MapManager)
  mapManager!: IMapManagerExtensions;
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
  @extensionInterface(EXT_SpawnManager)
  spawnManager!: ISpawnManagerExtensions;
  @extensionInterface(EXT_TerminalNetwork)
  terminalNetwork!: ITerminalNetworkExtensions;

  RunThread(): ThreadState {
    let creep: Creep | undefined = undefined;
    if (this.memory.creepID) {
      creep = this.creepManager.tryGetCreep(this.memory.creepID, this.pid) as Creep | undefined;
      if (creep && !creep.spawning) {
        if (!this.memory.activityPID || !this.kernel.getProcessByPID(this.memory.activityPID)) {
          this.CreateActivityForCreep(this.memory.creepID!);
          this.memory.hasRun = true;
        }
      }
    }

    if (!creep) {
      if (!this.memory.activityPID || !this.kernel.getProcessByPID(this.memory.activityPID)) {
        if (this.memory.expires && this.memory.hasRun) {
          this.EndProcess();
        } else {
          this.CreateSpawnActivity();
        }
      }
    }

    return ThreadState_Done;
  }

  CreateSpawnActivity() {
    const sID = this.GetNewSpawnID();
    if (!sID) {
      return;
    }

    const spawnMem: SpawnActivity_Memory = {
      spawnID: sID,
      HC: 'CreateActivityForCreep'
    }
    this.memory.activityPID = this.kernel.startProcess(APKG_SpawnActivity, spawnMem)
    this.kernel.setParent(this.memory.activityPID, this.pid);
  }
  protected abstract GetNewSpawnID(): string | undefined;

  CreateActivityForCreep(creepID: CreepID) {
    this.creepManager.tryReserveCreep(creepID, this.pid);
    const creep = this.creepManager.tryGetCreep(creepID, this.pid);
    this.memory.creepID = creepID;
    if (!creep) {
      if (this.memory.expires) {
        this.EndProcess();
      }
      return;
    }

    this.memory.activityPID = this.CreateCustomCreepActivity(creep);
    if (!this.memory.activityPID) {
      this.HandleNoActivity(creep);
    } else {
      this.kernel.setParent(this.memory.activityPID, this.pid);
      const childActivity = this.kernel.getProcessByPID(this.memory.activityPID)!;
      if (!childActivity.memory.HC) {
        childActivity.memory.HC = 'CreateActivityForCreep';
      }
    }
  }

  protected abstract CreateCustomCreepActivity(creep: Creep): PID | undefined;
  protected HandleNoActivity(creep: Creep) {
    this.EndProcess();
  }

  OnEndProcess() {
    if (this.memory.creepID) {
      this.creepManager.releaseCreep(this.memory.creepID, this.pid);
    }
  }

  MoveToRoom(creep: Creep, targetRoom: RoomID) {
    const route = this.mapManager.GetRoute(creep.room.name, targetRoom);
    if (route == -2) { return; }
    let exit = null;
    if (route.length > 0) {
      exit = creep.pos.findClosestByPath(route[0].exit);
    }
    if (!exit) { return; }
    return this.creepManager.CreateNewCreepActivity({
      action: AT_MoveToPosition,
      creepID: creep.name,
      pos: exit,
      amount: 0
    }, this.pid);
  }
}