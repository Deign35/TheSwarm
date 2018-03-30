declare interface IData<T extends SwarmDataType> extends Dictionary {
    id: string;
    MEM_TYPE: T;
}
declare interface IOtherData extends IData<SwarmDataType.Other> {
    isActive: boolean;
    // Used for any generic memory data.
}
declare interface ISwarmData<T extends SwarmDataType, U extends SwarmType> extends IData<T> {
    SWARM_TYPE: U;
    isActive: boolean;
}
declare interface ICreepData extends ISwarmData<SwarmDataType.Creep, SwarmType.SwarmCreep> {
    CREEP_TYPE: number;
    // Special info for creeps
}
declare interface IStructureData<T extends SwarmStructureType> extends ISwarmData<SwarmDataType.Structure, T> {
    // Special info for structure
}
declare type IContainerData = IStructureData<SwarmType.SwarmContainer>;
declare type IControllerData = IStructureData<SwarmType.SwarmController>;
declare type IExtensionData = IStructureData<SwarmType.SwarmExtension>;
declare type IExtractorData = IStructureData<SwarmType.SwarmExtractor>;
declare type IKeepersLairData = IStructureData<SwarmType.SwarmKeepersLair>;
declare type ILabData = IStructureData<SwarmType.SwarmLab>;
declare type ILinkData = IStructureData<SwarmType.SwarmLink>;
declare type INukerData = IStructureData<SwarmType.SwarmNuker>;
declare type IObserverData = IStructureData<SwarmType.SwarmObserver>;
declare type IPortalData = IStructureData<SwarmType.SwarmPortal>;
declare type IPowerBankData = IStructureData<SwarmType.SwarmPowerBank>;
declare type IPowerSpawnData = IStructureData<SwarmType.SwarmPowerSpawn>;
declare type IRampartData = IStructureData<SwarmType.SwarmRampart>;
declare type IRoadData = IStructureData<SwarmType.SwarmRoad>;
declare type ISpawnData = IStructureData<SwarmType.SwarmSpawn>;
declare type IStorageData = IStructureData<SwarmType.SwarmStorage>;
declare type ITerminalData = IStructureData<SwarmType.SwarmTerminal>;
declare type ITowerData = IStructureData<SwarmType.SwarmTower>;
declare type IWallData = IStructureData<SwarmType.SwarmWall>;

declare type TStructureData = IContainerData | IControllerData | IExtensionData | IExtractorData | IKeepersLairData |
    ILabData | ILinkData | INukerData | IObserverData | IPortalData | IPowerBankData | IPowerSpawnData | IRampartData |
    IRoadData | ISpawnData | IStorageData | ITerminalData | ITowerData | IWallData;

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
declare interface IRoomObjectMemory<T extends SwarmRoomObjectType>
    extends IMemory<IRoomObjectData<T>, SwarmDataType.RoomObject> {

}
declare type IMineralMemory = IRoomObjectMemory<SwarmType.SwarmMineral>;
declare type INukeMemory = IRoomObjectMemory<SwarmType.SwarmNuke>;
declare type IResourceMemory = IRoomObjectMemory<SwarmType.SwarmResource>;
declare type ISiteMemory = IRoomObjectMemory<SwarmType.SwarmSite>;
declare type ISourceMemory = IRoomObjectMemory<SwarmType.SwarmSource>;
declare type ITombstoneMemory = IRoomObjectMemory<SwarmType.SwarmTombstone>;

declare type TRoomObjectMemory = IMineralMemory | INukeMemory | IResourceMemory | ISiteMemory | ISourceMemory | ITombstoneMemory;

declare interface IStructureMemory<T extends SwarmStructureType>
    extends IMemory<IStructureData<T>, SwarmDataType.Structure> {

}
declare type IContainerMemory = IStructureMemory<SwarmType.SwarmContainer>;
declare type IControllerMemory = IStructureMemory<SwarmType.SwarmController>;
declare type IExtensionMemory = IStructureMemory<SwarmType.SwarmExtension>;
declare type IExtractorMemory = IStructureMemory<SwarmType.SwarmExtractor>;
declare type IKeepersLairMemory = IStructureMemory<SwarmType.SwarmKeepersLair>;
declare type ILabMemory = IStructureMemory<SwarmType.SwarmLab>;
declare type ILinkMemory = IStructureMemory<SwarmType.SwarmLink>;
declare type INukerMemory = IStructureMemory<SwarmType.SwarmNuker>;
declare type IObserverMemory = IStructureMemory<SwarmType.SwarmObserver>;
declare type IPortalMemory = IStructureMemory<SwarmType.SwarmPortal>;
declare type IPowerBankMemory = IStructureMemory<SwarmType.SwarmPowerBank>;
declare type IPowerSpawnMemory = IStructureMemory<SwarmType.SwarmPowerSpawn>;
declare type IRampartMemory = IStructureMemory<SwarmType.SwarmRampart>;
declare type IRoadMemory = IStructureMemory<SwarmType.SwarmRoad>;
declare type ISpawnMemory = IStructureMemory<SwarmType.SwarmSpawn>;
declare type IStorageMemory = IStructureMemory<SwarmType.SwarmStorage>;
declare type ITerminalMemory = IStructureMemory<SwarmType.SwarmTerminal>;
declare type ITowerMemory = IStructureMemory<SwarmType.SwarmTower>;
declare type IWallMemory = IStructureMemory<SwarmType.SwarmWall>;

declare type TStructureMemory = IContainerMemory | IControllerMemory | IExtensionMemory | IExtractorMemory |
    IKeepersLairMemory | ILabMemory | ILinkMemory | INukerMemory | IObserverMemory | IPortalMemory |
    IPowerBankMemory | IPowerSpawnMemory | IRampartMemory | IRoadMemory | ISpawnMemory | IStorageMemory |
    ITerminalMemory | ITowerMemory | IWallMemory;

declare interface IOtherMemory extends IMemory<IOtherData, SwarmDataType.Other> {

}

declare type SwarmMemoryTypes = ICreepMemory | IFlagMemory | IRoomMemory |
    TRoomObjectMemory | TStructureMemory | IOtherMemory;

declare interface IMasterMemory<T extends MasterSwarmDataTypes> extends IMemory<T, SwarmDataType.Master> {
    CheckoutMemory(id: string): SwarmMemoryTypes;
    SaveMemory(childMemory: SwarmMemoryTypes): void;
}
declare interface IMasterCreepMemory extends IMasterMemory<IMasterCreepData> { }
declare interface IMasterFlagMemory extends IMasterMemory<IMasterFlagData> { }
declare interface IMasterRoomMemory extends IMasterMemory<IMasterRoomData> { }
declare interface IMasterRoomObjectMemory extends IMasterMemory<IMasterRoomObjectData> { }
declare interface IMasterStructureMemory extends IMasterMemory<IMasterStructureData> { }
declare interface IMasterOtherMemory extends IMasterMemory<IMasterOtherData> { }

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
