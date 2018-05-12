/** Energy Distribution */
declare interface EnergyDist_Memory {
    distributors: PID[];
    suppliers: SDictionary<EnergyDist_Supp>;
    requests: SDictionary<EnergyDist_Data>;
}
// Due to the number of entries, property names have been shortened to save Memory space.
declare interface EnergyDist_Data {
    act: boolean; // Active or not
    ass: number; // Currently assigned energy being delivered
    loc: string; // location of the request by roomID
    pri: Priority; // Priority of the requestor.
    ref: boolean; // Should this request automatically refresh itself
    req: number; // requested energy to be delivered
}

declare interface EnergyDist_Supp {
    loc: string; // location of the request by roomID
    has: number; // available energy for withdraw
    res: SDictionary<string>; // Reserved energy not to be removed by anyone else
}

/** Core OS */
declare interface KernelMemory {
    processTable: ProcessTable;
    processMemory: ProcessMemoryTable;
}

/** RoomData */
declare interface RoomData_StructureData {
    hits: number
    id: string;
    room?: string;
    x?: number;
    y?: number;
}
declare interface RoomData_StructureMemory {
    [STRUCTURE_CONTAINER]: RoomData_StructureData[];
    [STRUCTURE_ROAD]: RoomData_StructureData[];

    [STRUCTURE_EXTENSION]?: RoomData_StructureData[];
    [STRUCTURE_LAB]?: RoomData_StructureData[];
    [STRUCTURE_LINK]?: RoomData_StructureData[];
    [STRUCTURE_RAMPART]?: RoomData_StructureData[];
    [STRUCTURE_SPAWN]?: RoomData_StructureData[];
    [STRUCTURE_TOWER]?: RoomData_StructureData[];
    [STRUCTURE_WALL]?: RoomData_StructureData[];
    [index: string]: RoomData_StructureData[] | undefined;
}
declare interface RoomData_Memory {
    cSites: RoomData_StructureData[]; // (TODO): Change this to use a flag
    lastUpdated: number;
    mineralIDs: string[];
    minUpdateOffset: number;
    owner?: string;
    pid?: PID;
    resources: string[];
    sourceIDs: string[];
    structures: RoomData_StructureMemory
    tombstones: string[];
}

/** SpawnData */
declare interface SpawnData_Memory {
    queue: SDictionary<SpawnData_SpawnCard>;
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
declare interface CreepProcess_Memory {
    creep?: string;
    targetID?: string;
    homeRoom: string;
    targetRoom: string;
    retrieving: boolean;
}
declare interface SpawnRefiller_Memory extends CreepProcess_Memory {
}
declare interface Harvester_Memory extends CreepProcess_Memory {
    targetID: string;
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
declare interface RoomProcess_Memory {
    roomName: string;
    builders: PID[];
}

declare interface FirstRoom_Memory extends RoomProcess_Memory {
    refiller?: PID;
    sources: SDictionary<PID | undefined>;
    upgraders: PID[];
}


declare type ServiceProviderMemory = {
    services: {
        [id: string]: {
            pid: PID,
            serviceID: string
        }
    }
}