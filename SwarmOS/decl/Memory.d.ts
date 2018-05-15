//declare var Memory: { [id: string]: MemBase }
declare interface MemBase { }

declare type ObjectID = string;
declare type CreepID = ObjectID;
declare type StructureID = ObjectID;
declare type FlagID = ObjectID;

declare type RoomID = string;
declare type PlayerID = string;

/** Core OS */
declare interface KernelMemory extends MemBase {
    processTable: ProcessTable;
    processMemory: ProcessMemory;
    subscriptions: SDictionary<PID[]>;
    notifications: string[]
}
/** RoomViewData */
declare interface RoomViewData_Memory extends MemBase {
    [roomID: string]: RVD_RoomMemory
}

interface RVD_RoomMemory extends MemBase {
    cSites: RVD_StructureData[];
    lastUpdated: number;
    mineralIDs: ObjectID[];
    minUpdateOffset: number;
    owner?: PlayerID;
    pid?: PID;
    resources: ObjectID[];
    sourceIDs: ObjectID[];
    structures: RVD_StructureMemory
    tombstones: ObjectID[];

    [STRUCTURE_CONTROLLER]?: ObjectID;
    [STRUCTURE_STORAGE]?: ObjectID;
    [STRUCTURE_TERMINAL]?: ObjectID;
}
interface RVD_StructureData extends MemBase {
    id: ObjectID;
    hits?: number
    room?: RoomID;
    x?: number;
    y?: number;
}
interface RVD_StructureMemory extends MemBase {
    //[index: string]: RVD_StructureData[] | undefined;
    [STRUCTURE_CONTAINER]: RVD_StructureData[];
    [STRUCTURE_ROAD]: RVD_StructureData[];

    [STRUCTURE_EXTENSION]?: RVD_StructureData[];
    [STRUCTURE_LAB]?: RVD_StructureData[];
    [STRUCTURE_LINK]?: RVD_StructureData[];
    [STRUCTURE_RAMPART]?: RVD_StructureData[];
    [STRUCTURE_SPAWN]?: RVD_StructureData[];
    [STRUCTURE_TOWER]?: RVD_StructureData[];
    [STRUCTURE_WALL]?: RVD_StructureData[];
}

/** SpawnData */
declare interface SpawnerExtension_Memory extends MemBase {
    queue: SDictionary<SpawnerRequest>;
    spawnedCreeps: SDictionary<CreepContext>;
}
declare interface CreepContext extends MemBase {
    m: number;      // (m)ove
    n: CreepID;     // (n)ame
    o?: PID;         // (o)wner process

    a?: number;      // (a)ttack
    c?: number;      // (c)arry
    cl?: number;     // (cl)aim
    h?: number;      // (h)eal
    r?: number;      // (r)angedAttack
    t?: number;     // (t)ough
    w?: number;      // (w)ork
}
declare interface CreepContext_Worker extends CreepContext {
    w: number;      // (w)ork
    c: number;      // (c)arry
}
declare interface CreepContext_Claimer extends CreepContext {
    cl: number;     // (cl)aim
}
declare interface CreepContext_Attacker extends CreepContext {
    a: number;      // (a)ttack
    r: number;      // (r)angedAttack
    h: number;      // (h)eal
}

declare interface SpawnerRequest extends MemBase {
    con: CreepContext;  // Context
    id: SpawnRequestID; // requestID
    loc: RoomID;        // Where the spawn request originates
    pid: PID;           // RequestorPID
    pri: Priority;      // How much of a priority is this spawn??
    sta: SpawnState;    // Current Spawn state

    dm?: any;           // Default memory
    max?: number;       // Max spawning distance allowed for this spawn.
    spawner?: StructureID; // ID of the spawner that this creep is being spawned at.
}

/** Flag Memory */
declare interface FlagProcess_Memory extends MemBase {
    flagID: FlagID;
}

/** Flags Extension memory */
declare interface FlagMemory extends MemBase {
    [id: string]: PID
}

/** Creep extension Memory */
declare interface CreepMemory extends MemBase {
    [id: string]: CreepProcess_Memory
}

declare interface CreepProcess_Memory extends MemBase {
    SR?: SpawnRequestID;// Spawn request ID
    tar?: ObjectID;     // The current target
    home: RoomID;       // Room from where this creep was spawned
    loc: RoomID;        // Room location of where this creep is doing its shtuff
    get: boolean;       // Getting energy
    en: boolean;        // Enabled
}
declare interface SpawnRefiller_Memory extends CreepProcess_Memory {
}
declare interface Harvester_Memory extends CreepProcess_Memory {
    tar: string;
    linkID?: string;
    containerID?: string;
    constructionSite?: string;
}
declare interface Upgrader_Memory extends CreepProcess_Memory {
    isReserving?: boolean;
    isClaiming?: boolean;
}
declare interface Builder_memory extends CreepProcess_Memory {

}

/** Room Memory */
declare interface RoomProcess_Memory extends MemBase {
    roomName: string;
    creeps: RoomProcess_CreepMemory
}

declare interface RoomProcess_CreepMemory extends MemBase {
    bui: PID[]; // Builders
    ref?: PID[]; // Refillers
    harv?: PID[]; // Harvesters
    upg?: PID[]; // Upgraders

    misc?: PID[]; // Misc
}

declare interface BasicOwnedRoom_Memory extends RoomProcess_Memory {
    sources: SDictionary<PID | undefined>;
}

declare interface PackageProviderMemory extends MemBase {
    services: {
        [id: string]: {
            pid: PID,
            serviceID: string
        }
    }
}






/** Stats */
declare type RoomStats = {}
declare type MarketStats = {}
declare type CollectionStats = {}
declare type StatsMemoryStructure = {
    rooms: { [id: string]: RoomStats }
    market: MarketStats
    totalGCL: number
}
declare interface ProfilerMemory {
    data: { [name: string]: ProfilerData };
    start?: number;
    total: number;
}

interface ProfilerData {
    calls: number;
    time: number;
}