declare interface IData<T extends SwarmDataType> extends Dictionary {
    id: string;
    MEM_TYPE: T;
    SWARM_TYPE: SwarmType;
}
declare interface IConsulData<T extends ConsulType> extends ISwarmData<SwarmDataType.Consul, SwarmType.SwarmConsul> {
    isActive: boolean;
    SUB_TYPE: T;
}

declare interface HarvestConsulData extends IConsulData<ConsulType.Harvest> {
    sourceIDs: string[];
}
declare type TConsulData = HarvestConsulData;

declare interface IOtherData extends IData<SwarmDataType.Other> {
    isActive: boolean;
}

declare interface ISwarmData<T extends SwarmDataType, U extends SwarmType> extends IData<T> {
    SWARM_TYPE: U;
    SUB_TYPE: number | string;
    isActive: boolean;
}
declare interface ICreepData extends ISwarmData<SwarmDataType.Creep, SwarmType.SwarmCreep> {
}
declare interface IStructureData<T extends SwarmStructureType> extends ISwarmData<SwarmDataType.Structure, T> {
    SUB_TYPE: StructureConstant
}
declare interface IContainerData extends IStructureData<SwarmType.SwarmContainer> { }
declare interface IControllerData extends IStructureData<SwarmType.SwarmController> { }
declare interface IExtensionData extends IStructureData<SwarmType.SwarmExtension> { }
declare interface IExtractorData extends IStructureData<SwarmType.SwarmExtractor> { }
declare interface IKeepersLairData extends IStructureData<SwarmType.SwarmKeepersLair> { }
declare interface ILabData extends IStructureData<SwarmType.SwarmLab> { }
declare interface ILinkData extends IStructureData<SwarmType.SwarmLink> { }
declare interface INukerData extends IStructureData<SwarmType.SwarmNuker> { }
declare interface IObserverData extends IStructureData<SwarmType.SwarmObserver> { }
declare interface IPortalData extends IStructureData<SwarmType.SwarmPortal> { }
declare interface IPowerBankData extends IStructureData<SwarmType.SwarmPowerBank> { }
declare interface IPowerSpawnData extends IStructureData<SwarmType.SwarmPowerSpawn> { }
declare interface IRampartData extends IStructureData<SwarmType.SwarmRampart> { }
declare interface IRoadData extends IStructureData<SwarmType.SwarmRoad> { }
declare interface ISpawnData extends IStructureData<SwarmType.SwarmSpawn> { }
declare interface IStorageData extends IStructureData<SwarmType.SwarmStorage> { }
declare interface ITerminalData extends IStructureData<SwarmType.SwarmTerminal> { }
declare interface ITowerData extends IStructureData<SwarmType.SwarmTower> { }
declare interface IWallData extends IStructureData<SwarmType.SwarmWall> { }

declare type TStructureData = IContainerData | IControllerData | IExtensionData | IExtractorData | IKeepersLairData |
    ILabData | ILinkData | INukerData | IObserverData | IPortalData | IPowerBankData | IPowerSpawnData | IRampartData |
    IRoadData | ISpawnData | IStorageData | ITerminalData | ITowerData | IWallData;

declare interface IFlagData extends ISwarmData<SwarmDataType.Flag, SwarmType.SwarmFlag> {
    // Special info for flags
}
declare interface IRoomData extends ISwarmData<SwarmDataType.Room, SwarmType.SwarmRoom> {
}
declare interface IRoomObjectData<T extends SwarmRoomObjectType> extends ISwarmData<SwarmDataType.RoomObject, T> {
    // Special info for RoomObjects.
}
declare interface ISourceData extends IRoomObjectData<SwarmType.SwarmSource> {
    creepID: string | undefined;
    containerID: string | undefined;
    linkID: string | undefined;
    pileID: string | undefined;
    constructionID: string | undefined;
}
declare interface IMineralData extends IRoomObjectData<SwarmType.SwarmMineral> {
    creepID: string | undefined;
    containerID: string | undefined;
    pileID: string | undefined;
}
declare interface INukeData extends IRoomObjectData<SwarmType.SwarmNuke> { }
declare interface IResourceData extends IRoomObjectData<SwarmType.SwarmResource> { }
declare interface ITombstoneData extends IRoomObjectData<SwarmType.SwarmTombstone> { }
declare interface ISiteData extends IRoomObjectData<SwarmType.SwarmSite> { }

declare type TRoomObjectData = IMineralData | ISourceData | INukeData |
    IResourceData | ITombstoneData | ISiteData;

declare type TBasicSwarmData = TRoomObjectData | TStructureData | IRoomData | ICreepData | IFlagData | IOtherData;
declare type TBasicData = TBasicSwarmData | TConsulData;
declare interface IMasterData<T extends TBasicData> extends IData<SwarmDataType.Master> {
    ChildData: { [id: string]: T }
    MEM_TYPE: SwarmDataType.Master;
}
declare interface IMasterRoomObjectData extends IMasterData<TRoomObjectData> { }
declare interface IMasterFlagData extends IMasterData<IFlagData> { }
declare interface IMasterStructureData extends IMasterData<TStructureData> { }
declare interface IMasterRoomData extends IMasterData<IRoomData> { }
declare interface IMasterCreepData extends IMasterData<ICreepData> { }
declare interface IMasterOtherData extends IMasterData<IOtherData> { }
declare interface IMasterConsulData extends IMasterData<TConsulData> { }

declare type MasterSwarmDataTypes = IMasterRoomObjectData | IMasterFlagData | IMasterStructureData |
    IMasterRoomData | IMasterOtherData | IMasterCreepData | IMasterConsulData

declare type SwarmDataTypes = MasterSwarmDataTypes | TBasicData;