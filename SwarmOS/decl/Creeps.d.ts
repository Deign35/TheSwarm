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
  spawnID: SpawnRequestID;
}

declare interface SoloCreep_Memory extends MemBase {
  spawnID?: SpawnID;
  spawnTimer?: number;
  creepID?: CreepID;
  hasRun?: boolean;
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

declare interface ControlledRoomRefiller_Cache extends SoloCreep_Cache {
  link?: ObjectID;
}

declare interface LargeHarvester_Memory extends SoloCreep_Memory {
  remoteHarvester?: boolean;
  isZombie?: boolean;
}
declare interface LargeHarvester_Cache extends SoloCreep_Cache {
  curSource?: ObjectID;
  curContainer?: ObjectID;
  curLink?: ObjectID;
}
declare interface HarvesterMemory extends SoloCreep_Memory {
  source: ObjectID;
  container?: ObjectID;
  remoteHarvester?: boolean;
  link?: ObjectID;
  supportHarvester?: boolean;
  isZombie?: boolean;
}
declare interface ControlledRoomRefiller_Memory extends SoloCreep_Memory {
  isZombie?: boolean;
}
declare interface RemoteRefiller_Memory extends SoloCreep_Memory {
  link?: ObjectID;
}
declare interface MineralHarvester_Memory extends SoloCreep_Memory { }
declare interface MineralCollector_Memory extends SoloCreep_Memory { }
declare interface MineralCollector_Cache extends SoloCreep_Cache {
  container?: ObjectID;
}

declare interface Scientist_Memory extends SoloCreep_Memory { }
declare interface Scientist_Cache extends SoloCreep_Cache {
  curOrder?: ObjectID;
}
declare interface Worker_Memory extends SoloCreep_Memory { }
declare interface Scout_Memory extends SoloCreep_Memory { }
declare interface RoomBooter_Memory extends SoloCreep_Memory { }
declare interface Upgrader_Memory extends SoloCreep_Memory { }
declare interface ControllerClaimer_Memory extends SoloCreep_Memory {
  onlyReserve: boolean;
  onlyAttack: boolean;
}

//CLI(CLI_Launch, CPKG_ControllerClaimer, { homeRoom: "E15S41", targetRoom: "E15S43" });
//CLI(CLI_Launch, CPKG_RoomBooter, { homeRoom: "E15S41", targetRoom: "E15S43" })
//CLI(CLI_Launch, CPKG_Worker, { homeRoom: "E15S41", targetRoom: "E14S41" })
//CLI(CLI_Launch, CPKG_Scout, { homeRoom: "W3N7", targetRoom: "W3N9" })

// Game.market.createOrder({ type: ORDER_SELL, resourceType: RESOURCE_ZYNTHIUM, price: 0.08, totalAmount: 20000, roomName: "E11S44" })