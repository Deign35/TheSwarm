declare interface ISwarmMemory {
    GetData<T>(id: string): T;
    SetData<T>(id: string, data: T): void;
    RemoveData(id: string): void;
}
declare type SwarmMemoryType = SegmentMemoryType | StorageMemoryType | CacheMemoryType;
declare type SegmentMemoryType = {};
declare interface ISegmentMemory extends ISwarmMemory {

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

declare type StorageMemoryType = ConsulData | CreepMemory | RoomMemory | FlagMemory | StructureMemory
declare type ConsulData = {};
declare type CreepMemory = {
    consulData: { [consulType: string]: ConsulData }
}
declare type RoomMemory = {}
declare type FlagMemory = {}
declare type StructureMemory = {}
declare interface IStorageMemory extends ISwarmMemory {

}

declare type MemoryStructure = {
    creeps: { [creepName: string]: CreepMemory }
    rooms: { [roomId: string]: RoomMemory }
    flags: { [flagName: string]: FlagMemory }
    structures: { [structureName: string]: StructureMemory }
    INIT: boolean
}