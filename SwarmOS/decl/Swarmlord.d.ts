declare interface ISwarmMemory {
    id: string;
    MemoryType: number;
    GetData<Z>(id: string): Z;
    SetData<Z>(id: string, data: Z): void;
    RemoveData(id: string): void;
}
declare interface IStorageMemory<T extends StorageMemoryTypes> extends ISwarmMemory {
    MemoryType: StorageMemoryType;
    IsCheckedOut: boolean;
    ReserveMemory(): void;
    GetSavePath(): string[];
    GetSaveData(): T;
    SaveTo(parentObj: SwarmData | StorageMemoryStructure): void;
}

declare type SwarmData = StorageMemoryTypes// | EmptyDictionary //| SegmentMemoryType | CacheMemoryType
//declare type EmptyDictionary = Dictionary;

declare type StorageMemoryTypes =
    CreepData |
    RoomData |
    StructureData |
    FlagData |
    RoomObject /*|
    EmptyDictionary;
/**
 * Creep Data and associated memory
 */
declare type CreepData = {}

/**
 * Room Data and associated memory 
 */
declare type RoomData = {
    queenType: QueenType;
    roomObjectData: { [id: string]: RoomObjectData };
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
    CheckoutMemory<T extends StorageMemoryTypes, U extends IStorageMemory<T>>(id: string, path: string[], memoryType: StorageMemoryType): U;
    ReleaseMemory<T extends StorageMemoryTypes>(memObject: IStorageMemory<T>, save?: boolean): void;
    DeleteMemory<T extends StorageMemoryTypes>(memObject: IStorageMemory<T>): void;
    StorageMemoryTypeToString(memType: StorageMemoryType): string;
    GetMemoryEntries(memType: StorageMemoryType): string[];
    CreateNewStorageMemory<T extends StorageMemoryTypes>(id: string, path: string[], memType: StorageMemoryType): void
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