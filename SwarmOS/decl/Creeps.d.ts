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

declare interface RepetitiveCreepActivity_Memory extends MemBase {
    actions: SingleCreepAction_Memory[];    // (a)ctions
    creepID: CreepID;
    childPID?: PID;
}

declare interface SpawnActivity_Memory extends MemBase {
  spawnID: SpawnRequestID;
}

declare interface SoloJob_Memory extends MemBase {
  activityPID?: PID;        // (a)ctivity
  creepID?: CreepID;    // (c)reep
  expires?: boolean;  // (exp)pires -- Kill the process when the creep dies
  roomID: RoomID;    // (h)ome room
  targetRoom: RoomID;     // (t)arget (r)oom
}
declare interface HarvesterMemory extends SoloJob_Memory {
    source: ObjectID;
    container: ObjectID;
}
declare interface ControlledRoomRefiller_Memory extends SoloJob_Memory {

}