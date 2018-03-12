declare interface ISwarmMemory {
    id: string;
    MemoryType: number;
    GetData<T>(id: string): T;
    SetData<T>(id: string, data: T): void;
    RemoveData(id: string): void;
}
declare type SwarmData = SegmentMemoryType | StorageMemoryTypes | CacheMemoryType | EmptyData;
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

declare type StorageMemoryTypes = ConsulData | CreepData | RoomData | StructureData | EmptyData;
declare type ConsulData = EmptyData;
declare type CreepData = {
    consulData: { [consulType: string]: ConsulData }
}
declare type RoomData = {
    queenType: QueenType
}
declare type FlagData = EmptyData
declare type StructureData = EmptyData
declare interface IStorageMemory extends ISwarmMemory {
    MemoryType: StorageMemoryType;
    IsCheckedOut: boolean;
    ReserveMemory(): void;
    GetSavePath(): string[];
    GetSaveData(): SwarmData;
    SaveTo(parentObj: SwarmData | StorageMemoryStructure): void;
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
    CheckoutMemory<T extends ISwarmMemory>(id: string, path: string[]): IStorageMemory;
    ReleaseMemory(memObject: IStorageMemory, save?: boolean): void;
    StorageMemoryTypeToString(memType: StorageMemoryType): string;
    CreateNewStorageMemory(id: string, path: string[], memType: StorageMemoryType): void 
}

declare var Swarmlord: ISwarmlord;