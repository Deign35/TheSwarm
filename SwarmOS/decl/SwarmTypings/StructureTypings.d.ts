declare type TStructureData = IContainerData | IControllerData | IExtensionData | IExtractorData | IKeepersLairData |
    ILabData | ILinkData | INukerData | IObserverData | IPortalData | IPowerBankData | IPowerSpawnData | IRampartData |
    IRoadData | ISpawnData | IStorageData | ITerminalData | ITowerData | IWallData;

declare interface IStructureData<T extends SwarmStructureType, U extends StructureConstant>
    extends ISwarmData<SwarmDataType.Structure, T, U> { }

declare interface IContainerData extends IStructureData<SwarmType.SwarmContainer, STRUCTURE_CONTAINER> { }
declare interface IControllerData extends IStructureData<SwarmType.SwarmController, STRUCTURE_CONTAINER> { }
declare interface IExtensionData extends IStructureData<SwarmType.SwarmExtension, STRUCTURE_CONTAINER> { }
declare interface IExtractorData extends IStructureData<SwarmType.SwarmExtractor, STRUCTURE_CONTAINER> { }
declare interface IKeepersLairData extends IStructureData<SwarmType.SwarmKeepersLair, STRUCTURE_CONTAINER> { }
declare interface ILabData extends IStructureData<SwarmType.SwarmLab, STRUCTURE_CONTAINER> { }
declare interface ILinkData extends IStructureData<SwarmType.SwarmLink, STRUCTURE_CONTAINER> { }
declare interface INukerData extends IStructureData<SwarmType.SwarmNuker, STRUCTURE_CONTAINER> { }
declare interface IObserverData extends IStructureData<SwarmType.SwarmObserver, STRUCTURE_CONTAINER> { }
declare interface IPortalData extends IStructureData<SwarmType.SwarmPortal, STRUCTURE_CONTAINER> { }
declare interface IPowerBankData extends IStructureData<SwarmType.SwarmPowerBank, STRUCTURE_CONTAINER> { }
declare interface IPowerSpawnData extends IStructureData<SwarmType.SwarmPowerSpawn, STRUCTURE_CONTAINER> { }
declare interface IRampartData extends IStructureData<SwarmType.SwarmRampart, STRUCTURE_CONTAINER> { }
declare interface IRoadData extends IStructureData<SwarmType.SwarmRoad, STRUCTURE_CONTAINER> { }
declare interface ISpawnData extends IStructureData<SwarmType.SwarmSpawn, STRUCTURE_CONTAINER> { }
declare interface IStorageData extends IStructureData<SwarmType.SwarmStorage, STRUCTURE_CONTAINER> { }
declare interface ITerminalData extends IStructureData<SwarmType.SwarmTerminal, STRUCTURE_CONTAINER> { }
declare interface ITowerData extends IStructureData<SwarmType.SwarmTower, STRUCTURE_CONTAINER> { }
declare interface IWallData extends IStructureData<SwarmType.SwarmWall, STRUCTURE_CONTAINER> { }
