import { profile } from "Tools/Profiler";
import { SwarmMemory } from "SwarmMemory/SwarmMemory";



@profile
export abstract class StructureMemoryBase<T extends SwarmStructureType, U extends StructureConstant>
    extends SwarmMemory<TStructureData, T, U> implements IStructureData<T, U> {
    get MEM_TYPE(): SwarmDataType.Structure { return SwarmDataType.Structure }
}

@profile
export class ContainerMemory extends StructureMemoryBase<SwarmType.SwarmContainer, STRUCTURE_CONTAINER> implements IContainerData { }
@profile
export class ControllerMemory extends StructureMemoryBase<SwarmType.SwarmController, STRUCTURE_CONTROLLER> implements IControllerData { }
@profile
export class ExtensionMemory extends StructureMemoryBase<SwarmType.SwarmExtension, STRUCTURE_EXTENSION> implements IExtensionData { }
@profile
export class ExtractorMemory extends StructureMemoryBase<SwarmType.SwarmExtractor, STRUCTURE_EXTRACTOR> implements IExtractorData { }
@profile
export class KeepersLairMemory extends StructureMemoryBase<SwarmType.SwarmKeepersLair, STRUCTURE_KEEPER_LAIR> implements IKeepersLairData { }
@profile
export class LabMemory extends StructureMemoryBase<SwarmType.SwarmLab, STRUCTURE_LAB> implements ILabData { }
@profile
export class LinkMemory extends StructureMemoryBase<SwarmType.SwarmLink, STRUCTURE_LINK> implements ILinkData { }
@profile
export class NukerMemory extends StructureMemoryBase<SwarmType.SwarmNuker, STRUCTURE_NUKER> implements INukerData { }
@profile
export class ObserverMemory extends StructureMemoryBase<SwarmType.SwarmObserver, STRUCTURE_OBSERVER> implements IObserverData { }
@profile
export class PortalMemory extends StructureMemoryBase<SwarmType.SwarmPortal, STRUCTURE_PORTAL> implements IPortalData { }
@profile
export class PowerBankMemory extends StructureMemoryBase<SwarmType.SwarmPowerBank, STRUCTURE_POWER_BANK> implements IPowerBankData { }
@profile
export class PowerSpawnMemory extends StructureMemoryBase<SwarmType.SwarmPowerSpawn, STRUCTURE_POWER_SPAWN> implements IPowerSpawnData { }
@profile
export class RampartMemory extends StructureMemoryBase<SwarmType.SwarmRampart, STRUCTURE_RAMPART> implements IRampartData { }
@profile
export class RoadMemory extends StructureMemoryBase<SwarmType.SwarmRoad, STRUCTURE_ROAD> implements IRoadData { }
@profile
export class SpawnMemory extends StructureMemoryBase<SwarmType.SwarmSpawn, STRUCTURE_SPAWN> implements ISpawnData { }
@profile
export class StorageMemory extends StructureMemoryBase<SwarmType.SwarmStorage, STRUCTURE_STORAGE> implements IStorageData { }
@profile
export class TerminalMemory extends StructureMemoryBase<SwarmType.SwarmTerminal, STRUCTURE_TERMINAL> implements ITerminalData { }
@profile
export class TowerMemory extends StructureMemoryBase<SwarmType.SwarmTower, STRUCTURE_TOWER> implements ITowerData { }
@profile
export class WallMemory extends StructureMemoryBase<SwarmType.SwarmWall, STRUCTURE_WALL> implements IWallData { }


export type StructureMemory = ContainerMemory | ControllerMemory | ExtensionMemory | ExtractorMemory | KeepersLairMemory |
    LabMemory | LinkMemory | NukerMemory | ObserverMemory | PortalMemory | PowerBankMemory | PowerSpawnMemory | RampartMemory |
    RoadMemory | SpawnMemory | StorageMemory | TerminalMemory | TowerMemory | WallMemory;