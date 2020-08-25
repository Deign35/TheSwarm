import { BasicProcess } from "Core/BasicTypes";

export abstract class CreepJob<T extends CreepJob_Memory> extends BasicProcess<T> {
  @extensionInterface(EXT_CreepManager)
  creepManager!: ICreepManagerExtensions;
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
  @extensionInterface(EXT_SpawnManager)
  spawnManager!: ISpawnManagerExtensions;

  protected assignedCreep?: Creep;

  PrepTick() {
    if (this.memory.creepID) {
      this.assignedCreep = this.creepManager.tryGetCreep(this.memory.creepID, this.pid);
    }
  }

  AssignCreep(creepID: CreepID) {
    this.creepManager.tryReserveCreep(creepID, this.pid);
  }

  ReleaseCreep() {
    if (this.memory.creepID) {
      this.creepManager.releaseCreep(this.memory.creepID, this.pid);
      // Let the parent know about the creep being released.
      (this.GetParentProcess() as IRoomJobCreeps).SurrenderCreep(this.memory.creepID);
    }
  }
}