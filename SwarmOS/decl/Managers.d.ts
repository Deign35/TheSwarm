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

interface RoomState extends MemBase {
  lastUpdated: number;

  activityPIDs: {
    RPKG_EnergyManager: PID,
    RPKG_Towers: PID
  }
  cSites: ObjectID[];
  mineralIDs: ObjectID[];
  sourceIDs: ObjectID[];
  needsRepair: ObjectID[];
  structures: RoomState_StructureData;
}

interface RoomState_StructureData {
  [STRUCTURE_TOWER]: ObjectID[];
}

/** Creepmanager */
declare interface CreepContext {
  ownerPID?: PID;        // (o)wner process
}

declare interface CreepManager_Memory extends MemBase {
  registeredCreeps: { [id in CreepID]: CreepContext };
}