declare var Memory: {
    testAlgorithms: Dictionary;
    profiler: Dictionary;

    kernel: KernelMemory;
    RoomData: IDictionary<RoomData_Memory>;
    stats: StatsMemoryStructure;

    counter: number;
    VERSION: string;
}

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

/** Stats */
declare type RoomStats = {}
declare type MarketStats = {}
declare type CollectionStats = {}
declare type StatsMemoryStructure = {
    rooms: { [id: string]: RoomStats }
    market: MarketStats
    totalGCL: number
}