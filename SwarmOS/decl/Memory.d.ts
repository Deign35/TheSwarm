/*declare var Memory: {
    testAlgorithms: Dictionary;
    roomData: IDictionary<RoomData_Memory>;
    spawnData: SpawnData_Memory;

    kernel: KernelMemory;
    stats: StatsMemoryStructure;
    profiler: ProfilerMemory;

    counter: number;
    VERSION: string;
}*/

/** Core OS */
declare interface KernelMemory {
    processTable: ProcessTable;
    processMemory: ProcessMemoryTable;
}

/** RoomData */
declare interface RoomData_StructureData {
    hits: number
    id: string,
    room?: string,
    x?: number,
    y?: number,
}
declare interface RoomData_StructureMemory {
    [STRUCTURE_CONTAINER]: RoomData_StructureData[],
    [STRUCTURE_ROAD]: RoomData_StructureData[],

    [STRUCTURE_EXTENSION]?: RoomData_StructureData[],
    [STRUCTURE_LAB]?: RoomData_StructureData[],
    [STRUCTURE_LINK]?: RoomData_StructureData[],
    [STRUCTURE_RAMPART]?: RoomData_StructureData[],
    [STRUCTURE_SPAWN]?: RoomData_StructureData[],
    [STRUCTURE_TOWER]?: RoomData_StructureData[],
    [STRUCTURE_WALL]?: RoomData_StructureData[],
    [index: string]: RoomData_StructureData[] | undefined
}
declare interface RoomData_Memory {
    cSites: RoomData_StructureData[]; // (TODO): Change this to use a flag
    lastUpdated: number;
    mineralIDs: string[];
    minUpdateOffset: number;
    owner?: string;
    resources: string[];
    sourceIDs: string[];
    structures: RoomData_StructureMemory
    tombstones: string[];
}

/** SpawnData */
declare interface SpawnData_Memory {
    queue: SDictionary<SpawnData_SpawnCard>,
    scheduledSpawn: any
}

declare interface SpawnData_SpawnCard {
    body: ISpawnDef;
    creepName: string;
    location: string;
    pid: PID;
    priority: Priority;
    spawnState: EPosisSpawnStatus;

    defaultMemory?: any;
    maxSpawnDist?: number;
    spawner?: string;
}
declare type SpawnRequest_BodyDef = EDictionary<ISpawnDef>;

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

/** Creep Memory */
declare interface CreepData_Memory {
    creep?: string;
}
declare interface Harvester_Memory extends CreepData_Memory {
    targetID: string;
    linkID?: string;
    containerID?: string;
}