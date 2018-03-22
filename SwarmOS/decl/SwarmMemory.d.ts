declare interface IData extends Dictionary {
    id: string;
    MEM_TYPE: number;
}
declare interface ISwarmData<T extends SwarmDataType, U extends SwarmType> extends IData {
    MEM_TYPE: T;
    SWARM_TYPE: U;
} declare type TSwarmData = ISwarmData<SwarmDataType, SwarmType>;
declare interface IOtherData extends ISwarmData<SwarmDataType.Other, SwarmType.Any> { }
declare interface ICreepData<T extends CreepModule> extends ISwarmData<SwarmDataType.Creep, SwarmType.SwarmCreep> {
    CM_TYPE: T;
    // Special info for creeps
} declare type TCreepData = ICreepData<CreepModule>
declare interface IStructureData<T extends SwarmStructureType> extends ISwarmData<SwarmDataType.Structure, SwarmStructureType> {
    // Special info for structure
} declare type TStructureData = IStructureData<SwarmStructureType>
declare interface IFlagData<T> extends ISwarmData<SwarmDataType.Flag, SwarmType.SwarmFlag> {
    FLG_TYPE: T;
    // Special info for flags
} declare type TFlagData = IFlagData<any>
declare interface IRoomData<T extends QueenType> extends ISwarmData<SwarmDataType.Room, SwarmType.SwarmRoom> {
    RM_TYPE: T;
    OBJs: IMasterRoomObjectData;
} declare type TRoomData = IRoomData<QueenType>;
declare interface IRoomObjectData<T extends RoomObjectDataType> extends ISwarmData<SwarmDataType.RoomObject, SwarmType> {
    RO_TYPE: T;
    // Special info for RoomObjects.
} declare type TRoomObjectData = IRoomObjectData<RoomObjectDataType>;
declare interface ISourceData extends IRoomObjectData<RoomObjectDataType.Source> {
    sourceID: string;
    nextSpawnRequiredBy: number;
    creepID?: string;
    containerID?: string;
    linkID?: string;
    pileID?: string;
}
declare interface IMineralData extends IRoomObjectData<RoomObjectDataType.Mineral> {
    mineralID: string;
    nextSpawnRequiredBy: number;
    creepID?: string;
    containerID?: string;
    pileID?: string;
}

declare type TBasicSwarmData = TRoomObjectData | TStructureData | TRoomData | TCreepData | TFlagData | IOtherData;

declare interface IMasterData<T extends IData> extends IData {
    ChildData: { [id: string]: T }
}
declare type TMasterData = IMasterData<IData>;
declare interface IMasterSwarmData<T extends TSwarmData> extends IMasterData<T> {
    MEM_TYPE: SwarmDataType.Master;
    // Data common to all MasterSwarmDatas (including IRoomObjectData)
} declare type TMasterSwarmData = IMasterSwarmData<TBasicSwarmData>;
declare interface IMasterRoomObjectData extends IMasterSwarmData<TRoomObjectData> { }
declare interface IMasterFlagData extends IMasterSwarmData<TFlagData> { }
declare interface IMasterStructureData extends IMasterSwarmData<TStructureData> { }
declare interface IMasterRoomData extends IMasterSwarmData<TRoomData> { }
declare interface IMasterCreepData extends IMasterSwarmData<TCreepData> { }
declare interface IMasterOtherData extends IMasterSwarmData<IOtherData> { }

declare interface IMemory<T extends IData> {
    // Doesn't ENFORCE that the MemoryType and GetSwarmData[MEM_TYPE] as the same, but can be manually kept up.
    id: string;
    HasData(id: string): boolean;
    GetData<Z>(id: string): Z;
    SetData<Z>(id: string, data: Z): void;
    RemoveData(id: string): void;
    GetDataIDs(): string[];

    IsCheckedOut: boolean;
    ReserveMemory(): void;
    ReleaseMemory(): T;
} declare type TMemory = IMemory<IData>;

declare interface ISwarmMemory<T extends TBasicSwarmData> extends IMemory<T> {
} declare type TSwarmMemory = ISwarmMemory<TBasicSwarmData>;
declare interface ICreepMemory extends ISwarmMemory<TCreepData> {

}
declare interface IFlagMemory extends ISwarmMemory<TFlagData> {

}
declare interface IRoomMemory extends ISwarmMemory<TRoomData> {

}
declare interface IRoomObjectMemory extends ISwarmMemory<TRoomObjectData> {

}

declare interface IStructureMemory extends ISwarmMemory<TStructureData> {

}

declare type SwarmMemoryTypes = ICreepMemory | IFlagMemory | IRoomMemory |
    IRoomObjectMemory | IStructureMemory | TSwarmMemory;

declare interface IMasterMemory<T extends TMasterData> extends IMemory<T> {
    CheckoutChildMemory(id: string): IMemory<T>;
    SaveChildMemory(childMemory: T): void;
    SaveToParent(parentMemory: TMasterMemory | ISwarmMemoryStructure): void;
} declare type TMasterMemory = IMasterMemory<TMasterData>;
declare interface IMasterSwarmMemory<T extends TMasterSwarmData> extends IMasterMemory<T> {
} declare type TMasterSwarmMemory = IMasterSwarmMemory<TMasterSwarmData>;
declare interface IMasterFlagMemory extends IMasterSwarmMemory<IMasterFlagData> { }
declare interface IMasterCreepMemory extends IMasterSwarmMemory<IMasterCreepData> { }
declare interface IMasterRoomMemory extends IMasterSwarmMemory<IMasterRoomData> { }
declare interface IMasterRoomObjectMemory extends IMasterSwarmMemory<IMasterRoomObjectData> { }
declare interface IMasterStructureMemory extends IMasterSwarmMemory<IMasterStructureData> { }


declare interface ISwarmMemoryStructure {
    creeps: IMasterCreepData;
    rooms: IMasterRoomData;
    flags: IMasterFlagData;
    structures: IMasterStructureData;
    profiler: any;
    SwarmVersionDate: string;
    INIT: boolean;
}
declare type PrimeMemoryTypes = IMasterFlagMemory | IMasterCreepMemory | IMasterRoomMemory | IMasterStructureMemory;
declare type PrimeDataTypes = SwarmControllerDataTypes.Creeps | SwarmControllerDataTypes.Flags |
    SwarmControllerDataTypes.Rooms | SwarmControllerDataTypes.Structures;

//IMasterSwarmMemory<T extends SwarmType>
declare interface ISwarmlord {
    ValidateMemory(): void;
    SaveMasterMemory<T extends TMasterSwarmMemory>(memObject: T, save?: boolean): void;
    CheckoutMasterMemory<T extends TMasterSwarmMemory>(dataType: string): T;
} declare var Swarmlord: ISwarmlord;
