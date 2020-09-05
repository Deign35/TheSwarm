declare interface RoomMemory extends MemBase {
  homeRoom: RoomID;
}

declare interface TowerMemory extends RoomMemory { }

declare interface EnergyManagerMemory extends RoomMemory {
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
}

//CLI(CLI_Launch, RPKG_RemoteManager, { homeRoom: "W55S27", targetRoom: "W54S27", harvesterPIDs: {}, numRefillers: 3, refillerPIDs: [] })