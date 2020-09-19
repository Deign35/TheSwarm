/** SpawnManager */
declare type SpawnRequestID = string;
declare type SpawnManager_Memory = MemBase & {
  [id in SpawnID]: SpawnRequest
}
declare interface SpawnContext extends MemBase {
  creepName: CreepID; // (n)ame
  body: BodyPartConstant[];  // Body definition
  owner_pid: PID;     // creep parent (p)id
}
declare interface SpawnRequest extends MemBase {
  maxDist: number;             // Max distance to spawn from
  spawnContext: SpawnContext;  // Context
  spawnID: SpawnRequestID      // The ID corresponding to this spawn
  spawnOrigin: RoomID;         // Where the spawn request originates
  spawnPriority: Priority;     // How much of a priority is this spawn??
  spawnState: SpawnState;      // Current Spawn state

  defaultMemory?: CreepMemory; // Default memory
  spawner?: StructureID;       // ID of the spawner that this creep is being spawned at.
}

/** RoomManager */
declare interface RoomStateMemory extends MemBase {
  roomStateData: {
    [id in RoomID]: RoomState
  }
}

interface LabReactionOrder {
  input_1: {
    lab_id: ObjectID;
    mineral: MineralConstant | MineralCompoundConstant | RESOURCE_ENERGY;
  },
  input_2: {
    lab_id: ObjectID;
    mineral: MineralConstant | MineralCompoundConstant | RESOURCE_ENERGY;
  }

  output_id: ObjectID;
}

declare interface LabOrder {
  resourceType: MineralConstant | MineralCompoundConstant | RESOURCE_ENERGY;
  amount: number;
  isOutput?: boolean;
  isForBoost?: boolean;
  isReverse?: boolean;

  creepID?: CreepID;
  lab_2?: ObjectID;
  lab_3?: ObjectID;
}

declare interface LabRequest {
  resourceType: MineralConstant | MineralCompoundConstant;
  amount: number;
  forBoost?: boolean;
  reverseReaction?: boolean;
  creepID?: CreepID;
}

interface RoomState extends MemBase {
  roomType: RoomType;
  lastUpdated: number;
  wallStrength?: number;
  rampartStrength?: number;
  homeRoom?: RoomID;

  labOrders: IDictionary<ObjectID, LabOrder>;
  labRequests: LabRequest[];

  activityPID?: PID;
  cSites: ObjectID[];
  mineralIDs: ObjectID[];
  sourceIDs: ObjectID[];
  needsRepair: ObjectID[];
  structures: RoomState_StructureData;
  resources: ObjectID[];
  tombstones: ObjectID[];
  ruins: ObjectID[];
}

interface RoomState_StructureData {
  [STRUCTURE_CONTROLLER]: ObjectID[];
  [STRUCTURE_CONTAINER]: ObjectID[];
  [STRUCTURE_EXTENSION]: ObjectID[];
  [STRUCTURE_EXTRACTOR]: ObjectID[];
  [STRUCTURE_LAB]: ObjectID[];
  [STRUCTURE_SPAWN]: ObjectID[];
  [STRUCTURE_STORAGE]: ObjectID[];
  [STRUCTURE_TERMINAL]: ObjectID[];
  [STRUCTURE_TOWER]: ObjectID[];
}

/** CreepManager */
declare interface CreepContext {
  ownerPID?: PID;        // (o)wner process
}

declare interface CreepManager_Memory extends MemBase {
  registeredCreeps: { [id in CreepID]: CreepContext };
}

/** MarketManager */
declare interface MarketManager_Memory extends MemBase {
  terminals: {
    [id: string]: string
  }
  lastUpdate: number;
  isEnabled: boolean;
}

/** MapManager */
declare interface MapManager_Memory extends MemBase {

}

/** BattleManager */
declare interface BattleManagerMemory extends MemBase {

}

declare interface BattleManagerCache extends MemCache {
  rooms: {
    [id: string]: {
      lastUpdated: number;
      creepContainer: IHostileCreepContainer;
    }
  }
}

declare interface IBattleManagerExtensions {
  GetHostileCreepContainer(roomID: RoomID): IHostileCreepContainer | undefined;
}

declare interface IHostileCreepContainer {
  GetNumHostiles(): number;
  GetAttackCreeps(): Creep[];
  GetHealCreeps(): Creep[];
  GetNonBattleCreeps(): Creep[];
}