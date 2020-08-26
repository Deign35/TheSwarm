/** Creep Job Memory */
declare interface CreepJob_Memory extends MemBase {
  room: RoomID;
}

declare interface HarvesterJob_Memory extends CreepJob_Memory {
  sources: SDictionary<CreepID>;
}

declare interface WorkerJob_Memory extends CreepJob_Memory {
  numWorkers: number;
  creepIDs: CreepID[];
  spawnIDs: SpawnID[];
}