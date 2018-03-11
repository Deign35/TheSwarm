declare interface ISwarmMemory {
    MemoryType: StorageMemoryType;
    GetData<T>(id: string): T;
    SetData<T>(id: string, data: T): void;
    RemoveData(id: string): void;
}
declare type SwarmMemoryType = SegmentMemoryType | StorageMemoryType | CacheMemoryType;
declare type SegmentMemoryType = {};
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

declare type ConsulData = IStorageMemory;
declare type CreepData = IStorageMemory & {
    consulData: { [consulType: string]: ConsulData }
}
declare type RoomData = IStorageMemory
declare type FlagData = IStorageMemory
declare type StructureData = IStorageMemory
declare interface IStorageMemory extends ISwarmMemory { }

declare type StorageMemoryStructure = {
    creeps: { [creepName: string]: CreepData }
    rooms: { [roomId: string]: RoomData }
    flags: { [flagName: string]: FlagData }
    structures: { [structureName: string]: StructureData }
    INIT: boolean
}

declare interface ISwarmlord {
    InitializeMemory(): void;
    CheckoutMemory(id: string, path: string[], memType: StorageMemoryType): IStorageMemory;
    CreateNewStorageMemory(id: string, path: string[], memType: StorageMemoryType): IStorageMemory;
}

declare var Swarmlord: ISwarmlord;