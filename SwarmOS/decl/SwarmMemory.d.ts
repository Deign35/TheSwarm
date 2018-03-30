declare interface IData<T extends SwarmDataType> extends Dictionary {
    id: string;
    MEM_TYPE: T;
}
declare interface IOtherData extends IData<SwarmDataType.Other> {
    // Used for any generic memory data.
}
declare interface ISwarmData<T extends SwarmDataType, U extends SwarmType> extends IData<T> {
    SWARM_TYPE: U;
}
declare interface ICreepData extends ISwarmData<SwarmDataType.Creep, SwarmType.SwarmCreep> {
    CREEP_TYPE: number;
    // Special info for creeps
}
declare interface IStructureData<T extends SwarmStructureType, U extends StructureConstant> extends ISwarmData<SwarmDataType.Structure, T> {
    STRUCT_TYPE: U;
    // Special info for structure
}
declare type IContainerData = IStructureData<SwarmType.SwarmContainer, STRUCTURE_CONTAINER>;
declare type IControllerData = IStructureData<SwarmType.SwarmController, STRUCTURE_CONTROLLER>;
declare type IExtensionData = IStructureData<SwarmType.SwarmExtension, STRUCTURE_EXTENSION>;
declare type IExtractorData = IStructureData<SwarmType.SwarmExtractor, STRUCTURE_EXTRACTOR>;
declare type IKeepersLairData = IStructureData<SwarmType.SwarmKeepersLair, STRUCTURE_KEEPER_LAIR>;
declare type ILabData = IStructureData<SwarmType.SwarmLab, STRUCTURE_LAB>;
declare type ILinkData = IStructureData<SwarmType.SwarmLink, STRUCTURE_LINK>;
declare type INukerData = IStructureData<SwarmType.SwarmNuker, STRUCTURE_NUKER>;
declare type IObserverData = IStructureData<SwarmType.SwarmObserver, STRUCTURE_OBSERVER>;
declare type IPortalData = IStructureData<SwarmType.SwarmPortal, STRUCTURE_PORTAL>;
declare type IPowerBankData = IStructureData<SwarmType.SwarmPowerBank, STRUCTURE_POWER_BANK>;
declare type IPowerSpawnData = IStructureData<SwarmType.SwarmPowerSpawn, STRUCTURE_POWER_SPAWN>;
declare type IRampartData = IStructureData<SwarmType.SwarmRampart, STRUCTURE_RAMPART>;
declare type IRoadData = IStructureData<SwarmType.SwarmRoad, STRUCTURE_ROAD>;
declare type ISpawnData = IStructureData<SwarmType.SwarmSpawn, STRUCTURE_SPAWN>;
declare type IStorageData = IStructureData<SwarmType.SwarmStorage, STRUCTURE_STORAGE>;
declare type ITerminalData = IStructureData<SwarmType.SwarmTerminal, STRUCTURE_TERMINAL>;
declare type ITowerData = IStructureData<SwarmType.SwarmTower, STRUCTURE_TOWER>;
declare type IWallData = IStructureData<SwarmType.SwarmWall, STRUCTURE_WALL>;

declare type TStructureData = IContainerData | IControllerData | IExtensionData | IExtractorData | ILabData |
    ILinkData | INukerData | IObserverData | IPortalData | IPowerBankData | IPowerSpawnData | IRampartData | IRoadData |
    ISpawnData | IStorageData | ITerminalData | ITowerData | IWallData;

declare interface IFlagData extends ISwarmData<SwarmDataType.Flag, SwarmType.SwarmFlag> {
    FLG_TYPE: number;
    // Special info for flags
}
declare interface IRoomData extends ISwarmData<SwarmDataType.Room, SwarmType.SwarmRoom> {
    RM_TYPE: number;
}
declare interface IRoomObjectData<T extends SwarmRoomObjectType> extends ISwarmData<SwarmDataType.RoomObject, T> {
    // Special info for RoomObjects.
}
declare interface ISourceData extends IRoomObjectData<SwarmType.SwarmSource> {
    nextSpawnRequiredBy: number;
    creepID?: string;
    containerID?: string;
    linkID?: string;
    pileID?: string;
}
declare interface IMineralData extends IRoomObjectData<SwarmType.SwarmMineral> {
    nextSpawnRequiredBy: number;
    creepID?: string;
    containerID?: string;
    pileID?: string;
}
declare type TNukeData = IRoomObjectData<SwarmType.SwarmNuke>;
declare type TResourceData = IRoomObjectData<SwarmType.SwarmResource>;
declare type TTombstoneData = IRoomObjectData<SwarmType.SwarmTombstone>;
declare type TConstructionSite = IRoomObjectData<SwarmType.SwarmSite>;
declare type TRoomObjectData = IMineralData | ISourceData | TNukeData |
    TResourceData | TTombstoneData | TConstructionSite;

declare type TBasicSwarmData = TRoomObjectData | TStructureData | IRoomData | ICreepData | IFlagData | IOtherData;

declare interface IMasterData<T extends TBasicSwarmData> extends IData<SwarmDataType.Master> {
    ChildData: { [id: string]: string }
    MEM_TYPE: SwarmDataType.Master;
}
declare interface IMasterRoomObjectData extends IMasterData<TRoomObjectData> { }
declare interface IMasterFlagData extends IMasterData<IFlagData> { }
declare interface IMasterStructureData extends IMasterData<TStructureData> { }
declare interface IMasterRoomData extends IMasterData<IRoomData> { }
declare interface IMasterCreepData extends IMasterData<ICreepData> { }
declare interface IMasterOtherData extends IMasterData<IOtherData> { }
declare type MasterSwarmDataTypes = IMasterRoomObjectData | IMasterFlagData | IMasterStructureData |
    IMasterRoomData | IMasterOtherData

declare interface IMemory<T extends IData<U>, U extends SwarmDataType> {
    id: string;
    HasData(id: string): boolean;
    GetData<Z>(id: string): Z;
    SetData<Z>(id: string, data: Z): void;
    RemoveData(id: string): void;
    GetDataIDs(): string[];

    IsCheckedOut: boolean;
    ReserveMemory(): void;
    ReleaseMemory(): T;
}
declare interface ICreepMemory extends IMemory<ICreepData, SwarmDataType.Creep> {

}
declare interface IFlagMemory extends IMemory<IFlagData, SwarmDataType.Flag> {

}
declare interface IRoomMemory extends IMemory<IRoomData, SwarmDataType.Room> {

}
declare interface IRoomObjectMemory extends IMemory<TRoomObjectData, SwarmDataType.RoomObject> {

}

declare interface IStructureMemory extends IMemory<TStructureData, SwarmDataType.Structure> {

}

declare interface IOtherMemory extends IMemory<IOtherData, SwarmDataType.Other> {

}

declare type SwarmMemoryTypes = ICreepMemory | IFlagMemory | IRoomMemory |
    IRoomObjectMemory | IStructureMemory | IOtherMemory;

declare interface IMasterMemory<T extends MasterSwarmDataTypes, U extends SwarmMemoryTypes> extends IMemory<T, SwarmDataType.Master> {
    CheckoutMemory(id: string): U;
    SaveMemory(childMemory: U): void;
}
declare interface IMasterCreepMemory extends IMasterMemory<IMasterCreepData, ICreepMemory> { }
declare interface IMasterFlagMemory extends IMasterMemory<IMasterFlagData, IFlagMemory> { }
declare interface IMasterRoomMemory extends IMasterMemory<IMasterRoomData, IRoomMemory> { }
declare interface IMasterRoomObjectMemory extends IMasterMemory<IMasterRoomObjectData, IRoomObjectMemory> { }
declare interface IMasterStructureMemory extends IMasterMemory<IMasterStructureData, IStructureMemory> { }
declare interface IMasterOtherMemory extends IMasterMemory<IMasterOtherData, IOtherMemory> { }

declare type MasterMemoryTypes = IMasterCreepMemory | IMasterFlagMemory | IMasterRoomMemory |
    IMasterRoomObjectMemory | IMasterStructureMemory | IMasterOtherMemory;


declare interface ISwarmMemoryStructure {
    creeps: IMasterCreepData;
    rooms: IMasterRoomData;
    flags: IMasterFlagData;
    structures: IMasterStructureData;
    roomObjects: IMasterRoomObjectData;
    otherData: IMasterOtherData;
    profiler: ProfilerMemory;
    stats: StatsMemoryStructure;
    SwarmVersionDate: string;
    INIT: boolean;
}

declare interface ISwarmlord {
    ValidateMemory(): void;
    SaveMasterMemory<T extends MasterMemoryTypes>(memObject: T, save?: boolean): void;
    CheckoutMasterMemory(dataType: string): MasterMemoryTypes;
} declare var Swarmlord: ISwarmlord;
