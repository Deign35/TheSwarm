import { profile } from "Tools/Profiler";
import { SwarmMemory } from "SwarmMemory/SwarmMemory";



@profile
export abstract class StructureMemoryBase<T extends SwarmStructureType>
    extends SwarmMemory<TStructureData, T> implements IStructureData<T> {
    get MEM_TYPE(): SwarmDataType.Structure { return SwarmDataType.Structure }
}

@profile
export class ContainerMemory extends StructureMemoryBase<SwarmType.SwarmContainer> implements IContainerData { }
@profile
export class ControllerMemory extends StructureMemoryBase<SwarmType.SwarmController> implements IControllerData { }
@profile
export class ExtensionMemory extends StructureMemoryBase<SwarmType.SwarmExtension> implements IExtensionData { }
@profile
export class ExtractorMemory extends StructureMemoryBase<SwarmType.SwarmExtractor> implements IExtractorData { }
@profile
export class KeepersLairMemory extends StructureMemoryBase<SwarmType.SwarmKeepersLair> implements IKeepersLairData { }
@profile
export class LabMemory extends StructureMemoryBase<SwarmType.SwarmLab> implements ILabData { }
@profile
export class LinkMemory extends StructureMemoryBase<SwarmType.SwarmLink> implements ILinkData { }
@profile
export class NukerMemory extends StructureMemoryBase<SwarmType.SwarmNuker> implements INukerData { }
@profile
export class ObserverMemory extends StructureMemoryBase<SwarmType.SwarmObserver> implements IObserverData { }
@profile
export class PortalMemory extends StructureMemoryBase<SwarmType.SwarmPortal> implements IPortalData { }
@profile
export class PowerBankMemory extends StructureMemoryBase<SwarmType.SwarmPowerBank> implements IPowerBankData { }
@profile
export class PowerSpawnMemory extends StructureMemoryBase<SwarmType.SwarmPowerSpawn> implements IPowerSpawnData { }
@profile
export class RampartMemory extends StructureMemoryBase<SwarmType.SwarmRampart> implements IRampartData { }
@profile
export class RoadMemory extends StructureMemoryBase<SwarmType.SwarmRoad> implements IRoadData { }
@profile
export class SpawnMemory extends StructureMemoryBase<SwarmType.SwarmSpawn> implements ISpawnData { }
@profile
export class StorageMemory extends StructureMemoryBase<SwarmType.SwarmStorage> implements IStorageData { }
@profile
export class TerminalMemory extends StructureMemoryBase<SwarmType.SwarmTerminal> implements ITerminalData { }
@profile
export class TowerMemory extends StructureMemoryBase<SwarmType.SwarmTower> implements ITowerData { }
@profile
export class WallMemory extends StructureMemoryBase<SwarmType.SwarmWall> implements IWallData { }


export type StructureMemory = ContainerMemory | ControllerMemory | ExtensionMemory | ExtractorMemory | KeepersLairMemory |
    LabMemory | LinkMemory | NukerMemory | ObserverMemory | PortalMemory | PowerBankMemory | PowerSpawnMemory | RampartMemory |
    RoadMemory | SpawnMemory | StorageMemory | TerminalMemory | TowerMemory | WallMemory;