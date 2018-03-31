declare interface IData<T extends SwarmDataType> extends Dictionary {
    id: string;
    MEM_TYPE: T;
    SWARM_TYPE: SwarmType;
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
    creepID?: string;
    containerID?: string;
    linkID?: string;
    pileID?: string;
}
declare interface IMineralData extends IRoomObjectData<SwarmType.SwarmMineral> {
    creepID?: string;
    containerID?: string;
    pileID?: string;
}
declare type TNukeData = IRoomObjectData<SwarmType.SwarmNuke>;
declare type TResourceData = IRoomObjectData<SwarmType.SwarmResource>;
declare type TTombstoneData = IRoomObjectData<SwarmType.SwarmTombstone>;
declare type TConstructionSiteData = IRoomObjectData<SwarmType.SwarmSite>;
declare type TRoomObjectData = IMineralData | ISourceData | TNukeData |
    TResourceData | TTombstoneData | TConstructionSiteData;

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

declare type SwarmDataTypes = MasterSwarmDataTypes | TBasicSwarmData;

declare interface IMemory<T extends SwarmDataTypes, U extends SwarmDataType> extends IData<U> {
    id: string;
    HasData(id: string): boolean;
    GetData<Z>(id: string): Z;
    SetData<Z>(id: string, data: Z): void;
    RemoveData(id: string): void;
    GetDataIDs(): string[];

    IsCheckedOut: boolean;
    ReserveMemory(): void;
    ReleaseData(): T;
}
declare interface ICreepMemory extends IMemory<ICreepData, SwarmDataType.Creep> {

}
declare interface IFlagMemory extends IMemory<IFlagData, SwarmDataType.Flag> {

}
declare interface IRoomMemory extends IMemory<IRoomData, SwarmDataType.Room> {

}
declare interface IRoomObjectMemory<T extends TRoomObjectData>
    extends IMemory<T, SwarmDataType.RoomObject> {

}
declare type IMineralMemory = IRoomObjectMemory<IMineralData>;
declare type INukeMemory = IRoomObjectMemory<TNukeData>;
declare type IResourceMemory = IRoomObjectMemory<TResourceData>;
declare type ISiteMemory = IRoomObjectMemory<TConstructionSiteData>;
declare type ISourceMemory = IRoomObjectMemory<ISourceData>;
declare type ITombstoneMemory = IRoomObjectMemory<TTombstoneData>;

declare type TRoomObjectMemory = IMineralMemory | INukeMemory | IResourceMemory | ISiteMemory | ISourceMemory | ITombstoneMemory;

declare interface IStructureMemory<T extends TStructureData>
    extends IMemory<T, SwarmDataType.Structure> {

}
declare type IContainerMemory = IStructureMemory<IContainerData>;
declare type IControllerMemory = IStructureMemory<IControllerData>;
declare type IExtensionMemory = IStructureMemory<IExtensionData>;
declare type IExtractorMemory = IStructureMemory<IExtractorData>;
declare type IKeepersLairMemory = IStructureMemory<IKeepersLairData>;
declare type ILabMemory = IStructureMemory<ILabData>;
declare type ILinkMemory = IStructureMemory<ILinkData>;
declare type INukerMemory = IStructureMemory<INukerData>;
declare type IObserverMemory = IStructureMemory<IObserverData>;
declare type IPortalMemory = IStructureMemory<IPortalData>;
declare type IPowerBankMemory = IStructureMemory<IPowerBankData>;
declare type IPowerSpawnMemory = IStructureMemory<IPowerSpawnData>;
declare type IRampartMemory = IStructureMemory<IRampartData>;
declare type IRoadMemory = IStructureMemory<IRoadData>;
declare type ISpawnMemory = IStructureMemory<ISpawnData>;
declare type IStorageMemory = IStructureMemory<IStorageData>;
declare type ITerminalMemory = IStructureMemory<ITerminalData>;
declare type ITowerMemory = IStructureMemory<ITowerData>;
declare type IWallMemory = IStructureMemory<IWallData>;

declare type TStructureMemory = IContainerMemory | IControllerMemory | IExtensionMemory | IExtractorMemory |
    IKeepersLairMemory | ILabMemory | ILinkMemory | INukerMemory | IObserverMemory | IPortalMemory |
    IPowerBankMemory | IPowerSpawnMemory | IRampartMemory | IRoadMemory | ISpawnMemory | IStorageMemory |
    ITerminalMemory | ITowerMemory | IWallMemory;

declare interface IOtherMemory extends IMemory<IOtherData, SwarmDataType.Other> {

}

declare type SwarmMemoryTypes = ICreepMemory | IFlagMemory | IRoomMemory |
    TRoomObjectMemory | TStructureMemory | IOtherMemory | MasterMemoryTypes;

declare interface IMasterMemory<T extends MasterSwarmDataTypes, U extends SwarmMemoryTypes>
    extends IMemory<T, SwarmDataType.Master> {
    CheckoutMemory(id: string): U;
    SaveMemory(childMemory: U): void;
}
declare interface IMasterCreepMemory extends IMasterMemory<IMasterCreepData, ICreepMemory> { }
declare interface IMasterFlagMemory extends IMasterMemory<IMasterFlagData, IFlagMemory> { }
declare interface IMasterRoomMemory extends IMasterMemory<IMasterRoomData, IRoomMemory> { }
declare interface IMasterRoomObjectMemory extends IMasterMemory<IMasterRoomObjectData, TRoomObjectMemory> { }
declare interface IMasterStructureMemory extends IMasterMemory<IMasterStructureData, TStructureMemory> { }
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
