declare interface ISwarmData<T extends SwarmDataType, U> extends IDictionary<T | U> {
    MEM_TYPE: T;
}
declare interface IEmptyData<T extends SwarmDataType> extends ISwarmData<T, any> { }
declare interface IOtherData<T extends any> extends ISwarmData<SwarmDataType.Other, T> {
}
declare interface IBasicData extends IOtherData<any> { }
declare interface ICreepData extends IEmptyData<SwarmDataType.Creep> {
    // Special info for creeps
}
declare interface IStructureData extends IEmptyData<SwarmDataType.Structure> {
    // Special info for structure
}
declare interface IFlagData extends IEmptyData<SwarmDataType.Flag> {
    // Special info for flags
}
declare interface IRoomData extends IEmptyData<SwarmDataType.Room> {
    queenType: QueenType;
    OBJs: IMasterRoomObjectData;
}
declare interface IRoomObjectData extends IEmptyData<SwarmDataType.RoomObject> {
    // Special info for RoomObjects.
}
declare interface ISourceData extends IRoomObjectData {
    sourceID: string;
    nextSpawnRequiredBy: number;
    creepID?: string;
    containerID?: string;
    linkID?: string;
    pileID?: string;
}
declare interface IMineralData extends IRoomObjectData {
    mineralID: string;
    nextSpawnRequiredBy: number;
    creepID?: string;
    containerID?: string;
    pileID?: string;
}
declare type TBasicSwarmDataTypes = ICreepData | IStructureData | IBasicData |
    IFlagData | IRoomData | IRoomObjectData | IOtherData<any>;

declare interface IMasterSwarmData<T extends TBasicSwarmDataTypes> extends IOtherData<T> {
    // Data common to all MasterSwarmDatas (including IRoomObjectData)
}
declare interface IMasterRoomObjectData extends IMasterSwarmData<IRoomObjectData> { }
declare interface IMasterFlagData extends IMasterSwarmData<IFlagData> { }
declare interface IMasterStructureData extends IMasterSwarmData<IStructureData> { }
declare interface IMasterRoomData extends IMasterSwarmData<IRoomData> { }
declare interface IMasterCreepData extends IMasterSwarmData<ICreepData> { }
declare type TAllMasterDataTypes = IMasterRoomObjectData | IMasterFlagData |
    IMasterStructureData | IMasterRoomData | IMasterCreepData;

declare type TAllSwarmDataTypes = TBasicSwarmDataTypes | TAllMasterDataTypes;

declare interface ISwarmMemory<T extends SwarmDataType, U extends ISwarmData<T, any>> {
    // Doesn't ENFORCE that the MemoryType and GetSwarmData[MEM_TYPE] as the same, but can be manually kept up.
    id: string;
    IsCheckedOut: boolean;
    MemoryType: T,
    GetData<Z>(id: string): Z;
    SetData<Z>(id: string, data: Z): void;
    GetIDs(): string[];
    HasData(id: string): boolean;
    RemoveData(id: string): void;
    ReserveMemory(): void;
    ReleaseMemory(): void;
    SaveChildMemory<A extends SwarmDataType, B extends ISwarmData<A, any>>(childMemory: ISwarmMemory<A, B>): void;
    GetSwarmData(): U;
    //AssignData(data: T): void;
}

declare interface IEmptyMemory<T extends SwarmDataType> extends ISwarmMemory<T, IEmptyData<T>> {

}

declare interface IOtherMemory<T extends any> extends IEmptyMemory<SwarmDataType.Other> {

}
declare interface ICreepMemory extends IEmptyMemory<SwarmDataType.Creep> {

}
declare interface IRoomObjectMemory extends IEmptyMemory<SwarmDataType.RoomObject> {

}
declare interface IStructureMemory extends IEmptyMemory<SwarmDataType.Structure> {

}
declare interface IFlagMemory extends IEmptyMemory<SwarmDataType.Flag> {

}
declare interface IRoomMemory extends IEmptyMemory<SwarmDataType.Room> {

}
declare type TBasicSwarmMemoryTypes = ICreepMemory | IOtherMemory<any> |
    IRoomObjectMemory | IStructureMemory | IFlagMemory | IRoomMemory;

declare interface IMasterSwarmMemory<T extends SwarmDataType>
    extends ISwarmMemory<SwarmDataType.Other, IOtherData<T>> {

}
declare interface IMasterFlagMemory extends IMasterSwarmMemory<SwarmDataType.Flag> { }
declare interface IMasterCreepMemory extends IMasterSwarmMemory<SwarmDataType.Creep> { }
declare interface IMasterRoomMemory extends IMasterSwarmMemory<SwarmDataType.Room> { }
declare interface IMasterRoomObjectMemory extends IMasterSwarmMemory<SwarmDataType.RoomObject> { }
declare interface IMasterStructureMemory extends IMasterSwarmMemory<SwarmDataType.Structure> { }

declare type TMasterMemoryTypes = IMasterFlagMemory | IMasterCreepMemory | IMasterRoomMemory |
    IMasterRoomObjectMemory | IMasterStructureMemory
declare type TAllSwarmMemoryTypes = TBasicSwarmMemoryTypes | TMasterMemoryTypes;

declare type TStorageMemoryStructure = {
    creeps: IMasterCreepData;
    rooms: IMasterRoomData;
    flags: IMasterFlagData;
    structures: IMasterStructureData;
    profiler: any;
    SwarmVersionDate: string;
    INIT: boolean;
}

declare interface ISwarmlord {
    ValidateMemory(): void;
    //CheckoutMemory<T extends SwarmDataType, U extends TAllSwarmDataTypes, X extends ISwarmMemory<T, U>>(id: string, memoryType: T, parentObj?: TAllSwarmMemoryTypes): X;
    ReserveMem<T extends SwarmDataType>(id: string, memoryType: T, parentObj?: TAllSwarmMemoryTypes): TAllSwarmMemoryTypes
    SaveMemory<T extends TMasterMemoryTypes>(memObject: T, save?: boolean): void;
    StorageMemoryTypeToString(memType: SwarmDataType): string;
    CreateNewSwarmMemory<T extends SwarmDataType>(id: string, memType: T, parentObj?: TAllSwarmMemoryTypes): void;
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