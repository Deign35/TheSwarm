import { BasicProcess } from "Core/BasicTypes";

export class CreepJob<T extends CreepJob_Memory> extends BasicProcess<T> {
  @extensionInterface(EXT_RoomManager)
  roomManager!: IRoomManagerExtension;
  @extensionInterface(EXT_SpawnManager)
  spawnManager!: ISpawnManagerExtensions

  RunThread(): ThreadState {
    return ThreadState_Done;
  }
}