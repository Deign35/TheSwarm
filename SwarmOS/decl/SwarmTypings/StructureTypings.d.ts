declare type TStructureData = IContainerData | IControllerData | IExtensionData | IExtractorData | IKeepersLairData |
    ILabData | ILinkData | INukerData | IObserverData | IPortalData | IPowerBankData | IPowerSpawnData | IRampartData |
    IRoadData | ISpawnData | IStorageData | ITerminalData | ITowerData | IWallData;

declare interface IStructureData<T extends SwarmStructureType, U extends StructureConstant>
    extends ISwarmData<SwarmDataType.Structure, T, U> { }

declare interface IContainerData extends IStructureData<SwarmType.SwarmContainer, STRUCTURE_CONTAINER> { }
declare interface IControllerData extends IStructureData<SwarmType.SwarmController, STRUCTURE_CONTROLLER> { }
declare interface IExtensionData extends IStructureData<SwarmType.SwarmExtension, STRUCTURE_EXTENSION> { }
declare interface IExtractorData extends IStructureData<SwarmType.SwarmExtractor, STRUCTURE_EXTRACTOR> { }
declare interface IKeepersLairData extends IStructureData<SwarmType.SwarmKeepersLair, STRUCTURE_KEEPER_LAIR> { }
declare interface ILabData extends IStructureData<SwarmType.SwarmLab, STRUCTURE_LAB> { }
declare interface ILinkData extends IStructureData<SwarmType.SwarmLink, STRUCTURE_LINK> { }
declare interface INukerData extends IStructureData<SwarmType.SwarmNuker, STRUCTURE_NUKER> { }
declare interface IObserverData extends IStructureData<SwarmType.SwarmObserver, STRUCTURE_OBSERVER> { }
declare interface IPortalData extends IStructureData<SwarmType.SwarmPortal, STRUCTURE_PORTAL> { }
declare interface IPowerBankData extends IStructureData<SwarmType.SwarmPowerBank, STRUCTURE_POWER_BANK> { }
declare interface IPowerSpawnData extends IStructureData<SwarmType.SwarmPowerSpawn, STRUCTURE_POWER_SPAWN> { }
declare interface IRampartData extends IStructureData<SwarmType.SwarmRampart, STRUCTURE_RAMPART> { }
declare interface IRoadData extends IStructureData<SwarmType.SwarmRoad, STRUCTURE_ROAD> { }
declare interface ISpawnData extends IStructureData<SwarmType.SwarmSpawn, STRUCTURE_SPAWN> { }
declare interface IStorageData extends IStructureData<SwarmType.SwarmStorage, STRUCTURE_STORAGE> { }
declare interface ITerminalData extends IStructureData<SwarmType.SwarmTerminal, STRUCTURE_TERMINAL> { }
declare interface ITowerData extends IStructureData<SwarmType.SwarmTower, STRUCTURE_TOWER> { }
declare interface IWallData extends IStructureData<SwarmType.SwarmWall, STRUCTURE_WALL> { }
