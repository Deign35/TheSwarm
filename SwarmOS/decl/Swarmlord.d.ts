declare interface ISwarmMemory {
    id: string;
    MemoryType: number;
    GetData<T>(id: string): T;
    SetData<T>(id: string, data: T): void;
    RemoveData(id: string): void;
}
declare type SwarmData = SegmentMemoryType | StorageMemoryType | CacheMemoryType | EmptyData;
declare type EmptyData = {};
declare type SegmentMemoryType = EmptyData;
declare interface ISegmentMemory extends ISwarmMemory {
    segmentID: number
}

declare type CacheMemoryType = CostMatrixMemory;
declare type CostMatrixMemory = {
    matrix: CostMatrix
}
declare interface ICacheMemory extends ISwarmMemory {

}
declare type CacheMemoryStructure = {
    CostMatrices: { [id: string]: CostMatrixMemory }
}

declare type ConsulData = EmptyData;
declare type CreepData = {
    consulData: { [consulType: string]: ConsulData }
}
declare type RoomData = EmptyData
declare type FlagData = EmptyData
declare type StructureData = EmptyData
declare interface IStorageMemory extends ISwarmMemory {
    MemoryType: StorageMemoryType;
    IsCheckedOut: boolean;
    SavePath: string[];
    SaveData: SwarmData;
    SaveTo(parentObj: IStorageMemory | StorageMemoryStructure): void;
    ReserveMemory(): void;
}

declare type StorageMemoryStructure = {
    creeps: { [creepName: string]: CreepData }
    rooms: { [roomId: string]: RoomData }
    flags: { [flagName: string]: FlagData }
    structures: { [structureName: string]: StructureData }
    profiler: any;
    INIT: boolean
}

declare interface ISwarmlord {
    ValidateMemory(): void;
    CreateNewStorageMemory(id: string, path: string[], memType: StorageMemoryType, data?: any): void;
}

declare var Swarmlord: ISwarmlord;