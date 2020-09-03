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

declare interface MoveToRoomActivity_Memory extends MemBase {
  creepID: CreepID;
  targetRoom: RoomID;
  moveTarget: RoomPosition;
  route: { exit: ExitConstant, room: string }[];
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
  hasRun?: boolean;
  expires?: boolean;  // (exp)pires -- Kill the process when the creep dies
  roomID: RoomID;    // (h)ome room
  targetRoom: RoomID;     // (t)arget (r)oom
}
declare interface HarvesterMemory extends SoloJob_Memory {
  source: ObjectID;
  container: ObjectID;
}
declare interface ControlledRoomRefiller_Memory extends SoloJob_Memory {
  lastTime: number;
}
declare interface Worker_Memory extends SoloJob_Memory {
}
declare interface Scout_Memory extends SoloJob_Memory {

}

declare interface SquadJob_Memory extends MemBase {
  expires?: boolean;
  roomID: RoomID;
  targetRoom: RoomID;
  squad: {
    activityPID?: PID;
    creepID?: CreepID;
  }[];
}

declare interface MineralHarvester_Memory extends SquadJob_Memory {
  container: ObjectID;
  squad: [{ activityPID?: PID, creepID?: CreepID },
    { activityPID?: PID, creepID?: CreepID }]
}

declare interface ExperimentalSquad_Memory extends SquadJob_Memory {
  invasion: number;
  container: ObjectID;
  sourceID: ObjectID;
  squad: [{ activityPID?: PID, creepID?: CreepID }, // Harvester
    { activityPID?: PID, creepID?: CreepID },       // Collecter
    { activityPID?: PID, creepID?: CreepID },       // Builder
    { activityPID?: PID, creepID?: CreepID },       // Claimer
    { activityPID?: PID, creepID?: CreepID },       // Collector 2
    { activityPID?: PID, creepID?: CreepID }]       // Collector 3
}

//CLI(CLI_Launch, CPKG_ExperimentalSquad, { roomID: "W57S27", targetRoom: "W57S28", sourceID: '59f19f7582100e1594f34eff', squad: [{}, {}, {}, {}, {}, {}]})