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

declare interface IMasterSwarmData<T extends TBasicSwarmDataTypes> extends ISwarmData<SwarmDataType.Master, T> {
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

declare interface ISwarmMemory<T extends SwarmType, U extends SwarmDataType> {
    // Doesn't ENFORCE that the MemoryType and GetSwarmData[MEM_TYPE] as the same, but can be manually kept up.
    id: string;
    IsCheckedOut: boolean;
    MemoryType: U,
    GetData<Z>(id: string): Z;
    SetData<Z>(id: string, data: Z): void;
    GetIDs(): string[];
    HasData(id: string): boolean;
    RemoveData(id: string): void;
    ReserveMemory(): void;
    ReleaseMemory(): void;
}

declare interface IEmptyMemory<T extends SwarmDataType> extends ISwarmMemory<SwarmType, T> {

}


declare interface ICreepMemory extends ISwarmMemory<SwarmType.SwarmCreep, SwarmDataType.Creep> {

}
declare interface IFlagMemory extends ISwarmMemory<SwarmType.SwarmFlag, SwarmDataType.Flag> {

}
declare interface IRoomMemory extends ISwarmMemory<SwarmType.SwarmRoom, SwarmDataType.Room> {

}
declare interface IRoomObjectMemory<T extends SwarmRoomObjectType> extends ISwarmMemory<T, SwarmDataType.RoomObject> {

}

declare interface IStructureMemory extends ISwarmMemory<SwarmStructureType, SwarmDataType.Structure> {

}

declare type BasicMemoryTypes = ICreepMemory | IFlagMemory | IRoomMemory | IRoomObjectMemory<SwarmRoomObjectType> | IStructureMemory

declare interface IMasterSwarmMemory<T extends SwarmType>
    extends ISwarmMemory<T, SwarmDataType.Master> {
    CreateNewChildMemory(id: string): void;
    CheckoutChildMemory<U extends SwarmDataType>(id: string): ISwarmMemory<T, U>;
    SaveChildMemory<U extends SwarmDataType>(childMemory: IEmptyMemory<U>): void;
    SaveToParent<U extends SwarmType>(parentMemory: IMasterSwarmMemory<U> | ISwarmMemoryStructure): void;
}
declare interface IMasterFlagMemory extends IMasterSwarmMemory<SwarmType.SwarmFlag> { }
declare interface IMasterCreepMemory extends IMasterSwarmMemory<SwarmType.SwarmCreep> { }
declare interface IMasterRoomMemory extends IMasterSwarmMemory<SwarmType.SwarmRoom> { }
declare interface IMasterRoomObjectMemory extends IMasterSwarmMemory<SwarmRoomObjectType> { }
declare interface IMasterStructureMemory extends IMasterSwarmMemory<SwarmStructureType> { }

declare type TPrimeMemoryTypes = IMasterFlagMemory | IMasterCreepMemory | IMasterRoomMemory | IMasterStructureMemory
declare type TMasterMemoryTypes = IMasterRoomObjectMemory | TPrimeMemoryTypes;

declare type TAllSwarmMemoryTypes = BasicMemoryTypes | TMasterMemoryTypes;

declare interface ISwarmMemoryStructure {
    creeps: IMasterCreepData;
    rooms: IMasterRoomData;
    flags: IMasterFlagData;
    structures: IMasterStructureData;
    profiler: any;
    SwarmVersionDate: string;
    INIT: boolean;
}

declare type PrimeDataTypes = SwarmControllerDataTypes.Creeps | SwarmControllerDataTypes.Flags |
    SwarmControllerDataTypes.Rooms | SwarmControllerDataTypes.Structures;

declare interface ISwarmlord {
    ValidateMemory(): void;
    SaveMemory<T extends TPrimeMemoryTypes>(memObject: T, save?: boolean): void;
    CheckoutMasterMemory<T extends TPrimeMemoryTypes>(primeType: PrimeDataTypes): T; // Consequence of any i think.
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