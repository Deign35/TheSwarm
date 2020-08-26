/** Creep Job Memory */
declare interface CreepJob_Memory extends MemBase {
  room: RoomID;
  creepIDs: CreepID[];
  spawnIDs: SpawnRequestID[];
}

declare interface HarvesterJob_Memory extends CreepJob_Memory {
  sources: SDictionary<CreepID>;
}