declare interface ISwarmMemory {
    id: string;
    MemoryType: number;
    GetData<Z>(id: string): Z;
    SetData<Z>(id: string, data: Z): void;
    GetIDs(): string[];
    HasData(id: string): boolean;
    RemoveData(id: string): void;
}
declare interface IStorageMemory<T extends StorageMemoryType, U extends StorageMemoryTypes> extends ISwarmMemory {
    MemoryType: T;
    IsCheckedOut: boolean;
    ReserveMemory(): void;
    GetSaveData(): U;
    ReleaseMemory(): void;
    SaveChildMemory<A extends StorageMemoryType, B>(childMemory: IStorageMemory<A, B>): void;
}

declare type BaseMemory<T extends StorageMemoryType> = {
    MEM_TYPE: T;
}
declare type SwarmData<T extends StorageMemoryType, U extends StorageMemoryTypes> = BaseMemory<T> & IDictionary<U>

declare type StorageMemoryTypes =
    CreepData |
    RoomData |
    StructureData |
    FlagData |
    RoomObjectData |
    Dictionary;
/**
 * Creep Data and associated memory
 */
declare type CreepData = BaseMemory<StorageMemoryType.Creep>;

/**
 * Room Data and associated memory 
 */
declare type RoomData = BaseMemory<StorageMemoryType.Room> & {
    queenType: QueenType;
    OBJs: MasterRoomObjectData;
}
/** 
 * RoomObject Data and associated memory
*/
declare type RoomObjectData = (SourceData | MineralData) & BaseMemory<StorageMemoryType.RoomObject>
declare type SourceData = {
    sourceID: string;
    nextSpawnRequiredBy: number;
    creepID?: string;
    containerID?: string;
    linkID?: string;
    pileID?: string;
}
declare type MineralData = {
    mineralID: string;
    nextSpawnRequiredBy: number;
    creepID?: string;
    containerID?: string;
    pileID?: string;
}
/**
 * Flag Data and associated memory
 */
declare type FlagData = BaseMemory<StorageMemoryType.Flag> & {

}

/**
 * Structure Data and associated memory
 */
declare type StructureData = BaseMemory<StorageMemoryType.Structure> & {
}

/** 
 * Master memory types;
*/
declare type MasterRoomObjectData = SwarmData<StorageMemoryType.Other, RoomObjectData>;
declare type MasterCreepData = SwarmData<StorageMemoryType.Other, CreepData>;
declare type MasterStructureData = SwarmData<StorageMemoryType.Other, StructureData>;
declare type MasterRoomData = SwarmData<StorageMemoryType.Other, RoomData>;
declare type MasterFlagData = SwarmData<StorageMemoryType.Other, FlagData>;
declare type StorageMemoryStructure = {
    creeps: MasterCreepData;
    rooms: MasterRoomData;
    flags: MasterFlagData;
    structures: MasterStructureData;
    profiler: any;
    SwarmVersionDate: string;
    INIT: boolean;
}

declare type MasterMemoryTypes = MasterCreepData & MasterStructureData & MasterRoomData & MasterFlagData;

declare interface ISwarmlord {
    ValidateMemory(): void;
    CheckoutMemory(id: string, memoryType: StorageMemoryType, parentObj?: MasterMemoryTypes): MasterMemoryTypes;
    ReleaseMemory2(memObject: MasterMemoryTypes, save?: boolean): void;
    StorageMemoryTypeToString(memType: StorageMemoryType): string;
    CreateNewStorageMemory<T extends StorageMemoryType, U>(id: string, memType: StorageMemoryType, parentObj?: IStorageMemory<T, U>): void;
} declare var Swarmlord: ISwarmlord;



/*
declare type SegmentMemoryType = EmptyDictionary;
declare interface ISegmentMemory<T> extends ISwarmMemory<T> {
    segmentID: number
}

declare type CacheMemoryType = CostMatrixMemory;
declare type CostMatrixMemory = {
    matrix: CostMatrix
}
declare interface ICacheMemory<T> extends ISwarmMemory<T> {

}
declare type CacheMemoryStructure = {
    CostMatrices: { [id: string]: CostMatrixMemory }
}
*/