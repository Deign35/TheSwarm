declare interface RoomMemory extends MemBase {
  homeRoom: RoomID;
}

declare interface Tower_Memory extends RoomMemory { }

declare interface EnergyManager_Memory extends RoomMemory {
  harvesterPIDs: IDictionary<ObjectID, PID>;
  refillerPID: PID;
  numWorkers: number;
  workerPIDs: PID[];
  mineralHarvesterPID: PID;
}

declare interface RemoteManager_Memory extends RoomMemory {
  targetRoom: RoomID;
  harvesterPIDs: IDictionary<ObjectID, PID>;
  numRefillers: number;
  refillerPIDs: PID[];
  workerPID?: PID;
  claimerPID?: PID;
  invasion?: number;
  remoteProtector?: PID;
}

declare interface LabManager_Memory extends RoomMemory {
  scientistPID: PID;
}