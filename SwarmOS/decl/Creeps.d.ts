declare interface CreepMemBase extends MemBase {
  roomID: RoomID;
  creepID: CreepID;
}

declare interface HarvesterMemory extends CreepMemBase {
  targetID: ObjectID;
}

declare interface CreepRoleMemory {
  creepID: CreepID;
  spawnID: SpawnRequestID;
  target: ObjectID;
  action: ActionType;
}

declare interface GathererMemory extends CreepRoleMemory {
  gathering: boolean;
}

declare interface Harvester_1_Memory extends MemBase {
  roomID: RoomID;
  harvester: CreepRoleMemory;
  gatherer: GathererMemory;
}