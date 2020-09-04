declare interface RoomMemory extends MemBase {
  homeRoom: RoomID;
}

declare interface TowerMemory extends RoomMemory { }

declare interface EnergyManagerMemory extends RoomMemory {
  harvesterPIDs: IDictionary<ObjectID, PID>;
  refillerPID: PID;
  workerPIDs: PID[];
  mineralHarvesterPID: PID;
}

declare interface RemoteManager_Memory extends RoomMemory {
  targetRoom: RoomID;
  harvesterPIDs: Record<ObjectID, PID>;
  numRefillers: number;
  refillerPIDs: PID[];
  workerPID: PID;
  claimerPID: PID;
  invasion?: number;
}