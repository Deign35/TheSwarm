declare interface ISwarmMemory {
    id: string;
    MemoryType: number;
    GetData<T>(id: string): T;
    SetData<T>(id: string, data: T): void;
    RemoveData(id: string): void;
}
declare type SwarmData = SegmentMemoryType | StorageMemoryTypes | CacheMemoryType | EmptyData;
declare type EmptyData = Dictionary;
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

declare type StorageMemoryTypes = CreepSuitData | CreepData | RoomData | StructureData | FlagData;
declare type CreepSuitData = EmptyData;
declare type CreepData = {
    suitData: CreepSuitData[]
}
declare type RoomData = {
    queenType: QueenType
}
declare type FlagData = EmptyData
declare type StructureModuleData = EmptyData;
declare type StructureData = {
    modules: { [moduleType: number]: StructureModuleData }
}
declare interface IStorageMemory<T> extends ISwarmMemory {
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
}

declare var Swarmlord: ISwarmlord;