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

declare interface SingleCreepAction_Memory extends MemBase {
  creepID: CreepID;
  action: ActionType;
  amount?: number;     // (a)mount for resource transfers
  num?: number;     // (n)umber of times to run this action
  exemptedFailures?: ScreepsReturnCode[];    // (e)xempted failures
  message?: string;     // (m)essage to write to a say or signcontroller
  pos?: { x?: number, y?: number, roomName: string };  // (p)osition to move to
  resourceType?: ResourceConstant // (r)esource type to withdraw or transfer
  targetID?: ObjectID;   // (t)arget
}
declare interface SpawnActivity_Memory extends MemBase {
  sID: string;
}

declare interface SoloJob_Memory extends MemBase {
  activityPID?: PID;        // (a)ctivity
  creepID?: CreepID;    // (c)reep
  expires?: boolean;  // (exp)pires -- Kill the process when the creep dies
  roomID: RoomID;    // (h)ome room
  targetRoom: RoomID;     // (t)arget (r)oom
}