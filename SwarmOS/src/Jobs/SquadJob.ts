import { BasicProcess } from "Core/BasicTypes";

export abstract class SquadJob<T extends SquadJob_Memory> extends BasicProcess<T> {
  @extensionInterface(EXT_CreepManager)
  creepManager!: ICreepManagerExtensions;
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
  @extensionInterface(EXT_SpawnManager)
  spawnManager!: ISpawnManagerExtensions;

  protected get homeRoom(): Room {
    return Game.rooms[this.memory.roomID];
  }

  RunThread(): ThreadState {
    for (let i = 0; i < this.memory.squad.length; i++) {
      let creep: Creep | undefined = undefined;
      if (this.memory.squad[i].creepID) {
        creep = this.creepManager.tryGetCreep(this.memory.squad[i].creepID!, this.pid) as Creep | undefined;
        if (creep && !creep.spawning) {
          if (!this.memory.squad[i].activityPID ||
            !this.kernel.getProcessByPID(this.memory.squad[i].activityPID!)) {
            this.CreateCreepActivity(i, this.memory.squad[i].creepID!);
          }
        }
      }

      if (!creep) {
        if (!this.memory.squad[i].activityPID) {
          this.CreateSpawnActivity(i);
        } else if (!this.kernel.getProcessByPID(this.memory.squad[i].activityPID!)) {
          if (this.memory.expires) {
            this.EndProcess();
          } else {
            this.CreateSpawnActivity(i);
          }
        }
      }
    }

    return ThreadState_Done;
  }

  CreateSpawnActivity(squadID: number) {
    let sID = this.GetNewSpawnID(squadID);
    let spawnMem: SpawnActivity_Memory = {
      spawnID: sID,
      HC: 'AssignCreep'
    }
    this.memory.squad[squadID].activityPID = this.kernel.startProcess(APKG_SpawnActivity, spawnMem)
    this.kernel.setParent(this.memory.squad[squadID].activityPID!, this.pid);
  }
  protected abstract GetNewSpawnID(squadID: number): string;

  AssignCreep(creepID: CreepID, pid: PID) {
    for (let i = 0; i < this.memory.squad.length; i++) {
      if (this.memory.squad[i].activityPID && this.memory.squad[i].activityPID == pid) {
        this.CreateCreepActivity(i, creepID);
        return;
      }
    }
  }

  CreateCreepActivity(squadID: number, creepID: CreepID) {
    this.creepManager.tryReserveCreep(creepID, this.pid);
    let creep = this.creepManager.tryGetCreep(creepID, this.pid);
    this.memory.squad[squadID].creepID = creepID;
    if (!creep) {
      if (this.memory.expires) {
        this.EndProcess();
      }
      return;
    }
    this.memory.squad[squadID].activityPID = this.CreateCustomCreepActivity(squadID, creep);
    if (!this.memory.squad[squadID].activityPID) {
      this.HandleNoActivity();
    } else {
      this.kernel.setParent(this.memory.squad[squadID].activityPID!, this.pid);
      let childActivity = this.kernel.getProcessByPID(this.memory.squad[squadID].activityPID!)!;
      if (!childActivity.memory.HC) {
        childActivity.memory.HC = 'AssignCreep';
      }
    }
  }
  protected abstract CreateCustomCreepActivity(squadID: number, creep: Creep): PID | undefined;
  protected HandleNoActivity() {
    this.EndProcess();
  }

  EndProcess() {
    for (let i = 0; i < this.memory.squad.length; i++) {
      if (this.memory.squad[i].creepID) {
        this.creepManager.releaseCreep(this.memory.squad[i].creepID!, this.pid);
      }
    }

    super.EndProcess();
  }
}