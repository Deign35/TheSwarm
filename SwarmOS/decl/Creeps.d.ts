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
  hasRun?: boolean;
  expires?: boolean;  // (exp)pires -- Kill the process when the creep dies
  homeRoom: RoomID;    // (h)ome room
  targetRoom: RoomID;     // (t)arget (r)oom
}
declare interface HarvesterMemory extends SoloJob_Memory {
  source: ObjectID;
  container: ObjectID;
  remoteHarvester?: boolean;
}
declare interface ControlledRoomRefiller_Memory extends SoloJob_Memory {
  lastTime: number;
}
declare interface Dismantler_Memory extends SoloJob_Memory { }
declare interface Worker_Memory extends SoloJob_Memory {
  needsBoost: boolean;
  hasRequestedBoost: boolean;
}
declare interface Scout_Memory extends SoloJob_Memory { }
declare interface RoomBooter_Memory extends SoloJob_Memory { }
declare interface Upgrader_Memory extends SoloJob_Memory {
  needsBoost: boolean;
  hasRequestedBoost: boolean;
}
declare interface ControllerClaimer_Memory extends SoloJob_Memory {
  onlyReserve: boolean;
  onlyAttack: boolean;
}
declare interface RemoteRefiller_Memory extends SoloJob_Memory { }
declare interface Scientist_Memory extends SoloJob_Memory { }
declare interface RoomDefender_Memory extends SoloJob_Memory {
  needsBoost: boolean;
  hasRequestedBoost: boolean;
}
declare interface RoomDefender_2_Memory extends SoloJob_Memory {
  needsBoost: boolean;
  hasRequestedBoost: boolean;
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

/** REFACTOR SOLOJOB TO SOLOCREEP */

declare interface SoloCreep_Memory extends MemBase {
  spawnID?: SpawnID;
  creepID?: CreepID;
  hasRun?: boolean;
  expires?: boolean;
  homeRoom: RoomID;
  targetRoom: RoomID;
  needsBoost?: boolean;
}

declare interface SoloCreepAction {
  action: ActionType;
  amount?: number;     // (a)mount for resource transfers
  exemptedFailures?: ScreepsReturnCode[];    // (e)xempted failures
  message?: string;     // (m)essage to write to a say or signcontroller
  pos?: { x?: number, y?: number, roomName: string };  // (p)osition to move to
  resourceType?: ResourceConstant // (r)esource type to withdraw or transfer
  targetID?: ObjectID;   // (t)arget
  distance?: number;
}

declare interface SoloCreep_Cache extends MemCache {
  curAction?: SoloCreepAction;
  lastAction?: SoloCreepAction;
}

declare interface SoloCreepActionArgs {
  creep: Creep;
  actionType: ActionType;

  target?: any;
  amount?: number;
  distance?: number;
  message?: string;
  resourceType?: ResourceConstant;
}

//CLI(CLI_Launch, CPKG_ControllerClaimer, { homeRoom: "E15S41", targetRoom: "E15S43", expires: true });
//CLI(CLI_Launch, CPKG_RoomBooter, { homeRoom: "E15S41", targetRoom: "E15S43", expires: true })
//CLI(CLI_Launch, CPKG_Worker, { homeRoom: "E15S41", targetRoom: "E14S41", expires: true })

// Game.market.createOrder({ type: ORDER_SELL, resourceType: RESOURCE_ZYNTHIUM, price: 0.08, totalAmount: 20000, roomName: "E11S44" })