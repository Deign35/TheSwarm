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
    SUB_TYPE: number | string;
    isActive: boolean;
}
declare interface ICreepData extends ISwarmData<SwarmDataType.Creep, SwarmType.SwarmCreep> {
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
    // Special info for flags
}
declare interface IRoomData extends ISwarmData<SwarmDataType.Room, SwarmType.SwarmRoom> {
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

declare interface IMasterData<T extends SwarmDataType> extends IData<SwarmDataType.Master> {
    ChildData: { [id: string]: IData<T> }
    MEM_TYPE: SwarmDataType.Master;
}
declare interface IMasterRoomObjectData extends IMasterData<SwarmDataType.RoomObject> { }
declare interface IMasterFlagData extends IMasterData<SwarmDataType.Flag> { }
declare interface IMasterStructureData extends IMasterData<SwarmDataType.Structure> { }
declare interface IMasterRoomData extends IMasterData<SwarmDataType.Room> { }
declare interface IMasterCreepData extends IMasterData<SwarmDataType.Creep> { }
declare interface IMasterOtherData extends IMasterData<SwarmDataType.Other> { }
declare type MasterSwarmDataTypes = IMasterRoomObjectData | IMasterFlagData | IMasterStructureData |
    IMasterRoomData | IMasterOtherData

declare type SwarmDataTypes = MasterSwarmDataTypes | TBasicSwarmData;