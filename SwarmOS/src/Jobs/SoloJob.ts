import { BasicProcess } from "Core/BasicTypes";

export abstract class SoloJob<T extends SoloJob_Memory> extends BasicProcess<T> {
  @extensionInterface(EXT_CreepManager)
  creepManager!: ICreepManagerExtensions;
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
  @extensionInterface(EXT_SpawnManager)
  spawnManager!: ISpawnManagerExtensions;

  protected get homeRoom(): Room {
    return Game.rooms[this.memory.roomID];
  }
  protected creep: Creep | undefined;

  RunThread(): ThreadState {
    if (this.memory.creepID) {
      this.creep = this.creepManager.tryGetCreep(this.memory.creepID, this.pid) as Creep | undefined;
      if (this.creep && !this.creep.spawning) {
        if (!this.memory.activityPID || !this.kernel.getProcessByPID(this.memory.activityPID)) {
          this.CreateActivityForCreep(this.memory.creepID!);
        }
      }
    }

    if (!this.creep) {
      if (!this.memory.activityPID) {
        this.CreateSpawnActivity();
      } else if (!this.kernel.getProcessByPID(this.memory.activityPID)) {
        if (this.memory.expires) {
          this.EndProcess();
        } else {
          this.CreateSpawnActivity();
        }
      }
    }

    return ThreadState_Done;
  }

  CreateSpawnActivity() {
    let sID = this.GetNewSpawnID();
    let spawnMem: SpawnActivity_Memory = {
      spawnID: sID,
      HC: 'CreateActivityForCreep'
    }
    this.memory.activityPID = this.kernel.startProcess(APKG_SpawnActivity, spawnMem)
    this.kernel.setParent(this.memory.activityPID, this.pid);
  }
  protected abstract GetNewSpawnID(): string;

  CreateActivityForCreep(creepID: CreepID) {
    this.creepManager.tryReserveCreep(creepID, this.pid);
    this.creep = this.creepManager.tryGetCreep(creepID, this.pid);
    this.memory.creepID = creepID;
    if (!this.creep) {
      if (this.memory.expires) {
        this.EndProcess();
      }
      return;
    }

    let targetRoom = this.GetTargetRoomForCreep(this.creep);
    if (this.creep.room.name != targetRoom) {
      this.memory.activityPID = this.kernel.startProcess(APKG_MoveToRoomActivity, {
        creepID: creepID,
        targetRoom: targetRoom
      } as MoveToRoomActivity_Memory);
    } else {
      this.memory.activityPID = this.CreateCustomCreepActivity(this.creep);
      if (!this.memory.activityPID) {
        this.HandleNoActivity();
      } else {
        this.kernel.setParent(this.memory.activityPID, this.pid);
        let childActivity = this.kernel.getProcessByPID(this.memory.activityPID)!;
        if (!childActivity.memory.HC) {
          childActivity.memory.HC = 'CreateCreepActivity';
        }
      }
    }
  }
  protected abstract CreateCustomCreepActivity(creep: Creep): PID | undefined;
  protected GetTargetRoomForCreep(creep: Creep): RoomID {
    return this.memory.targetRoom;
  }
  protected HandleNoActivity() {
    this.EndProcess();
  }

  EndProcess() {
    if (this.memory.creepID) {
      this.creepManager.releaseCreep(this.memory.creepID, this.pid);
      super.EndProcess(this.memory.creepID);
    }
  }
}