declare interface CreepMemBase extends MemBase {
  roomID: RoomID;
  creepID: CreepID;
}

declare interface HarvesterMemory extends CreepMemBase {
  targetID: ObjectID;
}