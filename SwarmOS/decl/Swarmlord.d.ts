declare interface ISwarmMemory {
    id: string;
    MemoryType: number;
    GetData<Z>(id: string): Z;
    SetData<Z>(id: string, data: Z): void;
    GetIDs(): string[];
    HasData(id: string): boolean;
    RemoveData(id: string): void;
}
declare interface IStorageMemory<T extends StorageMemoryTypes> extends ISwarmMemory {
    MemoryType: StorageMemoryType;
    IsCheckedOut: boolean;
    ReserveMemory(): void;
    GetSaveData(): T;
    ReleaseMemory(): void;
    SaveChildMemory(childMemory: IStorageMemory<StorageMemoryTypes>): void;
}

declare type SwarmData = StorageMemoryTypes// | EmptyDictionary //| SegmentMemoryType | CacheMemoryType
//declare type EmptyDictionary = Dictionary;

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
declare type CreepData = {}

/**
 * Room Data and associated memory 
 */
declare type RoomData = {
    queenType: QueenType;
    OBJs: { [id: string]: RoomObjectData };
}
declare type RoomObjectData = SourceData// || EmptyDictionary;
declare type SourceData = {
    sourceID: string;
    nextSpawnRequiredBy: number;
    creepID?: string;
    containerID?: string;
    linkID?: string;
    pileID?: string;
}
/**
 * Flag Data and associated memory
 */
declare type FlagData = {} // EmptyDictionary;

/**
 * Structure Data and associated memory
 */
declare type StructureModuleData = {} //EmptyDictionary;
declare type StructureData = {
    modules: { [moduleType: number]: StructureModuleData }
}

declare type StorageMemoryStructure = {
    creeps: { [creepName: string]: CreepData }
    rooms: { [roomId: string]: RoomData }
    flags: { [flagName: string]: FlagData }
    structures: { [structureName: string]: StructureData }
    profiler: any;
    SwarmVersionDate: string;
    INIT: boolean;
}

declare interface ISwarmlord {
    ValidateMemory(): void;
    CheckoutMemory(id: string, memoryType: StorageMemoryType, parentObj?: IStorageMemory<StorageMemoryTypes>): IStorageMemory<StorageMemoryTypes>;
    ReleaseMemory2(memObject: IStorageMemory<StorageMemoryTypes>, save?: boolean): void;
    StorageMemoryTypeToString(memType: StorageMemoryType): string;
    CreateNewStorageMemory(id: string, memType: StorageMemoryType, parentObj?: IStorageMemory<StorageMemoryTypes>): void;
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