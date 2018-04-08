declare type TStructureData = IContainerData | IControllerData | IExtensionData | IExtractorData | IKeepersLairData |
    ILabData | ILinkData | INukerData | IObserverData | IPortalData | IPowerBankData | IPowerSpawnData | IRampartData |
    IRoadData | ISpawnData | IStorageData | ITerminalData | ITowerData | IWallData;

declare type TOwnabledStructureData = IControllerData | IExtensionData | IExtractorData | IKeepersLairData |
    ILabData | ILinkData | INukerData | IObserverData | IPowerSpawnData | IRampartData | ISpawnData |
    IStorageData | ITerminalData | ITowerData;

declare type OwnableStructureConstant = STRUCTURE_CONTROLLER | STRUCTURE_EXTENSION | STRUCTURE_EXTRACTOR |
    STRUCTURE_KEEPER_LAIR | STRUCTURE_LAB | STRUCTURE_LINK | STRUCTURE_NUKER | STRUCTURE_OBSERVER | STRUCTURE_POWER_BANK |
    STRUCTURE_POWER_SPAWN | STRUCTURE_RAMPART | STRUCTURE_SPAWN | STRUCTURE_STORAGE | STRUCTURE_TERMINAL | STRUCTURE_TOWER

declare type SwarmOwnableStructureType = SwarmType.SwarmController | SwarmType.SwarmExtension | SwarmType.SwarmExtractor |
    SwarmType.SwarmKeepersLair | SwarmType.SwarmLab | SwarmType.SwarmLink | SwarmType.SwarmNuker | SwarmType.SwarmObserver |
    SwarmType.SwarmPowerBank | SwarmType.SwarmPowerSpawn | SwarmType.SwarmRampart | SwarmType.SwarmSpawn |
    SwarmType.SwarmStorage | SwarmType.SwarmTerminal | SwarmType.SwarmTower

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



declare interface AIStructureBase<T extends TStructureData, U extends Structure> extends AIBase<T, U> {

}
declare interface AIContainer extends AIStructureBase<IContainerData, StructureContainer> {

}
declare interface AIController extends AIStructureBase<IControllerData, StructureController> {

}
declare interface AIExtension extends AIStructureBase<IExtensionData, StructureExtension> {

}
declare interface AIExtractor extends AIStructureBase<IExtractorData, StructureExtractor> {

}
declare interface AIKeepersLair extends AIStructureBase<IKeepersLairData, StructureKeeperLair> {

}
declare interface AILab extends AIStructureBase<ILabData, StructureLab> {

}
declare interface AILink extends AIStructureBase<ILinkData, StructureLink> {

}
declare interface AINuker extends AIStructureBase<INukerData, StructureNuker> {

}
declare interface AIObserver extends AIStructureBase<IObserverData, StructureObserver> {

}
declare interface AIPortal extends AIStructureBase<IPortalData, StructurePortal> {

}
declare interface AIPowerBank extends AIStructureBase<IPowerBankData, StructurePowerBank> {

}
declare interface AIPowerSpawn extends AIStructureBase<IPowerSpawnData, StructurePowerSpawn> {

}
declare interface AIRampart extends AIStructureBase<IRampartData, StructureRampart> {

}
declare interface AIRoad extends AIStructureBase<IRoadData, StructureRoad> {

}
declare interface AISpawn extends AIStructureBase<ISpawnData, StructureSpawn> {

}
declare interface AIStorage extends AIStructureBase<IStorageData, StructureStorage> {

}
declare interface AITerminal extends AIStructureBase<ITerminalData, StructureTerminal> {

}
declare interface AITower extends AIStructureBase<ITowerData, StructureTower> {

}
declare interface AIWall extends AIStructureBase<IWallData, StructureWall> {

}

declare type AIOwnableStructure = AIController | AIExtension | AIExtractor | AIKeepersLair | AILab |
    AILink | AINuker | AIObserver | AIPowerSpawn | AIRampart | AISpawn | AIStorage | AITerminal | AITower;

declare type AIStructure = AIOwnableStructure | AIContainer | AIPortal | AIPowerBank | AIRoad | AISpawn | AIWall;