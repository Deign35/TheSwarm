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
declare type SwarmData = StorageMemoryTypes | EmptyDictionary //| SegmentMemoryType | CacheMemoryType
declare type EmptyDictionary = Dictionary;
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
declare type StorageMemoryTypes = CreepSuitData | CreepData | RoomData | StructureData | FlagData | JobData | EmptyDictionary;
declare type CreepSuitData = EmptyDictionary;
declare type CreepData = {
    suitData: CreepSuitData[]
}
declare type RoomData = {
    queenType: QueenType,
    harvestData: HarvesterData[]
}
declare type ObjectData = EmptyDictionary | HarvesterData;
declare type HarvesterData = {
    sourceID: string;
    nextSpawnRequiredBy: number;
    creepID?: string;
    containerID?: string;
    linkID?: string;
    pileID?: string;
}
declare type JobData = EmptyDictionary;
declare type FlagData = EmptyDictionary;
declare type StructureModuleData = EmptyDictionary;
declare type StructureData = {
    modules: { [moduleType: number]: StructureModuleData }
}

declare type StorageMemoryStructure = {
    creeps: { [creepName: string]: CreepData }
    rooms: { [roomId: string]: RoomData }
    flags: { [flagName: string]: FlagData }
    structures: { [structureName: string]: StructureData }
    neuralNetwork: JobMemoryDataStructure;
    profiler: any;
    SwarmVersionDate: string;
    INIT: boolean;
}

declare interface IJobDefinition {
    GetJobLocation(): RoomPosition;
    EvaluateCreepCompatability(creep: TSwarmCreep): number;
    JobPriority: Priority;
}

declare type JobMemoryDataStructure = {
    Cluster: { [roomID: string]: IJobDefinition[] }
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