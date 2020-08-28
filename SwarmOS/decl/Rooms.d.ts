declare interface RoomMemory extends MemBase {
  roomID: RoomID;
}

declare interface TowerMemory extends RoomMemory {

}

declare interface EnergyManagerMemory extends RoomMemory {
  harvesterPIDs: IDictionary<ObjectID, PID>;
  refillerPID: PID;
  workerPIDs: PID[];
}