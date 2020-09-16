import { BasicProcess } from "Core/BasicTypes";

export abstract class BattleSquad<T extends BattleSquad_Memory, U extends MemCache> extends BasicProcess<T, U> {
  @extensionInterface(EXT_BattleManager)
  battleManager!: IBattleManagerExtensions;
  @extensionInterface(EXT_CreepManager)
  creepManager!: ICreepManagerExtensions;
  @extensionInterface(EXT_MapManager)
  mapManager!: IMapManagerExtensions;
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
  @extensionInterface(EXT_SpawnManager)
  spawnManager!: ISpawnManagerExtensions;

  RunThread(): ThreadState {
    if (this.memory.expires) {
      let count = 0;
      for (let i = 0; i < this.memory.squad.length; i++) {
        if (this.memory.squad[i].hasRun && (!this.memory.squad[i].activityPID ||
          !this.kernel.getProcessByPID(this.memory.squad[i].activityPID!) &&
          !this.creepManager.tryGetCreep(this.memory.squad[i].creepID!, this.pid))) {
          count++;
        }
      }

      if (count == this.memory.squad.length) {
        this.EndProcess();
        return ThreadState_Done;
      }
    }

    for (let i = 0; i < this.memory.squad.length; i++) {
      let creep: Creep | undefined = undefined;
      if (this.memory.squad[i].creepID) {
        creep = this.creepManager.tryGetCreep(this.memory.squad[i].creepID!, this.pid) as Creep | undefined;
        if (creep && !creep.spawning) {
          if (!this.memory.squad[i].activityPID ||
            !this.kernel.getProcessByPID(this.memory.squad[i].activityPID!)) {
            this.CreateActivityForCreep(i, this.memory.squad[i].creepID!);
            this.memory.squad[i].hasRun = true;
          }
        }
      }

      if (!creep) {
        if (!this.memory.expires || !this.memory.squad[i].hasRun) {
          if (!this.memory.squad[i].activityPID ||
            !this.kernel.getProcessByPID(this.memory.squad[i].activityPID!)) {
            this.CreateSpawnActivity(i);
          }
        }
      }
    }

    return ThreadState_Done;
  }

  CreateSpawnActivity(squadID: number) {
    const sID = this.GetNewSpawnID(squadID);
    if (!sID) {
      return;
    }

    const spawnMem: SpawnActivity_Memory = {
      spawnID: sID,
      HC: 'AssignCreep'
    }
    this.memory.squad[squadID].activityPID = this.kernel.startProcess(APKG_SpawnActivity, spawnMem);
    this.kernel.setParent(this.memory.squad[squadID].activityPID!, this.pid);
  }
  protected abstract GetNewSpawnID(squadID: number): string | undefined;

  AssignCreep(creepID: CreepID, pid: PID) {
    for (let i = 0; i < this.memory.squad.length; i++) {
      if (this.memory.squad[i].activityPID && this.memory.squad[i].activityPID == pid) {
        this.CreateActivityForCreep(i, creepID);
        return;
      }
    }
  }

  CreateActivityForCreep(squadID: number, creepID: CreepID) {
    this.creepManager.tryReserveCreep(creepID, this.pid);
    const creep = this.creepManager.tryGetCreep(creepID, this.pid);
    this.memory.squad[squadID].creepID = creepID;
    if (!creep) {
      return;
    }

    this.memory.squad[squadID].activityPID = this.CreateCustomCreepActivity(squadID, creep);
    if (!this.memory.squad[squadID].activityPID) {
      this.HandleNoActivity(squadID);
    } else {
      this.kernel.setParent(this.memory.squad[squadID].activityPID!, this.pid);
      const childActivity = this.kernel.getProcessByPID(this.memory.squad[squadID].activityPID!)!;
      if (!childActivity.memory.HC) {
        childActivity.memory.HC = 'AssignCreep';
      }
    }
  }

  protected abstract CreateCustomCreepActivity(squadID: number, creep: Creep): PID | undefined;
  protected HandleNoActivity(squadID: number) {
    this.EndProcess();
  }

  OnEndProcess() {
    console.log("ENDING BATTLESQUAD PROCESS");
    for (let i = 0; i < this.memory.squad.length; i++) {
      if (this.memory.squad[i].creepID) {
        this.creepManager.releaseCreep(this.memory.squad[i].creepID!, this.pid);
      }
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