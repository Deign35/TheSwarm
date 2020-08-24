/** SpawnManager */
declare type SpawnRequestID = string;
declare type SpawnManager_Memory = MemBase & {
  [id in SpawnID]: SpawnRequest
}
declare interface SpawnContext extends MemBase {
  creepName: CreepID; // (n)ame
  creepType: CT_ALL;  // (c)reep type
  level: number;  // (l)evel
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

/** RoomViewData */
declare interface RoomStateMemory extends MemBase {
  roomStateData: {
    [id in RoomID]: RoomState
  }
}

interface RoomState extends MemBase {
  lastUpdated: number;
  lastEnergy: number;

  cSites: ObjectID[];
  mineralIDs: ObjectID[];
  resources: ObjectID[];
  sourceIDs: ObjectID[];
  tombstones: ObjectID[];
  needsRepair: ObjectID[];
  minUpdateOffset: number;
  structures: RoomState_StructureData;
  activityPID: PID;
  owner?: PlayerID;
}

interface RoomState_StructureData {
  [STRUCTURE_CONTAINER]: ObjectID[];
  [STRUCTURE_ROAD]: ObjectID[]

  [STRUCTURE_EXTENSION]?: ObjectID[];
  [STRUCTURE_LAB]?: ObjectID[];
  [STRUCTURE_LINK]?: ObjectID[];
  [STRUCTURE_RAMPART]?: ObjectID[];
  [STRUCTURE_SPAWN]?: ObjectID[];
  [STRUCTURE_TOWER]?: ObjectID[];
  [STRUCTURE_WALL]?: ObjectID[];
  [id: string]: ObjectID[] | undefined;
}