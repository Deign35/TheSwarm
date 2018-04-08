import { SwarmMemoryWithSpecifiedData } from "SwarmMemory/SwarmMemory";
import { NotImplementedException } from "Tools/SwarmExceptions";

abstract class StructureMemoryBase<T extends SwarmStructureType,
    U extends StructureConstant, V extends IStructureData<T, U>>
    extends SwarmMemoryWithSpecifiedData<IStructureData<T, U>> implements IStructureData<T, U>{
    get MEM_TYPE(): SwarmDataType.Structure { return SwarmDataType.Structure }
    get SUB_TYPE(): U {
        switch (this.SWARM_TYPE) {
            case (SwarmType.SwarmContainer): return STRUCTURE_CONTAINER as U;
            case (SwarmType.SwarmController): return STRUCTURE_CONTROLLER as U;
            case (SwarmType.SwarmExtension): return STRUCTURE_EXTENSION as U;
            case (SwarmType.SwarmExtractor): return STRUCTURE_EXTRACTOR as U;
            case (SwarmType.SwarmKeepersLair): return STRUCTURE_KEEPER_LAIR as U;
            case (SwarmType.SwarmLab): return STRUCTURE_LAB as U;
            case (SwarmType.SwarmLink): return STRUCTURE_LINK as U;
            case (SwarmType.SwarmNuke): return STRUCTURE_NUKER as U;
            case (SwarmType.SwarmObserver): return STRUCTURE_OBSERVER as U;
            case (SwarmType.SwarmPortal): return STRUCTURE_PORTAL as U;
            case (SwarmType.SwarmPowerBank): return STRUCTURE_POWER_BANK as U;
            case (SwarmType.SwarmPowerSpawn): return STRUCTURE_POWER_SPAWN as U;
            case (SwarmType.SwarmRampart): return STRUCTURE_RAMPART as U;
            case (SwarmType.SwarmRoad): return STRUCTURE_ROAD as U;
            case (SwarmType.SwarmSpawn): return STRUCTURE_SPAWN as U;
            case (SwarmType.SwarmStorage): return STRUCTURE_STORAGE as U;
            case (SwarmType.SwarmTerminal): return STRUCTURE_TERMINAL as U;
            case (SwarmType.SwarmTower): return STRUCTURE_TOWER as U;
            case (SwarmType.SwarmWall): return STRUCTURE_WALL as U;
        }

        throw new NotImplementedException('SwarmType is not a valid structure type: ' + this.SWARM_TYPE);
    }
    abstract get SWARM_TYPE(): T;
}
abstract class StructureMemoryWithSpecifiedData<T extends TStructureData>
    extends StructureMemoryBase<SwarmStructureType, StructureConstant, T> {
}

export class ContainerMemory extends StructureMemoryWithSpecifiedData<IContainerData> implements IContainerData {
    get SUB_TYPE(): STRUCTURE_CONTAINER { return STRUCTURE_CONTAINER; }
    get SWARM_TYPE(): SwarmType.SwarmContainer { return SwarmType.SwarmContainer; }
}

export class ControllerMemory extends StructureMemoryWithSpecifiedData<IControllerData> implements IControllerData {
    get SUB_TYPE(): STRUCTURE_CONTROLLER { return STRUCTURE_CONTROLLER; }
    get SWARM_TYPE(): SwarmType.SwarmController { return SwarmType.SwarmController; }
}

export class ExtensionMemory extends StructureMemoryWithSpecifiedData<IExtensionData> implements IExtensionData {
    get SUB_TYPE(): STRUCTURE_EXTENSION { return STRUCTURE_EXTENSION; }
    get SWARM_TYPE(): SwarmType.SwarmExtension { return SwarmType.SwarmExtension; }
}

export class ExtractorMemory extends StructureMemoryWithSpecifiedData<IExtractorData> implements IExtractorData {
    get SUB_TYPE(): STRUCTURE_EXTRACTOR { return STRUCTURE_EXTRACTOR; }
    get SWARM_TYPE(): SwarmType.SwarmExtractor { return SwarmType.SwarmExtractor; }
}

export class KeepersLairMemory extends StructureMemoryWithSpecifiedData<IKeepersLairData> implements IKeepersLairData {
    get SUB_TYPE(): STRUCTURE_KEEPER_LAIR { return STRUCTURE_KEEPER_LAIR; }
    get SWARM_TYPE(): SwarmType.SwarmKeepersLair { return SwarmType.SwarmKeepersLair; }
}

export class LabMemory extends StructureMemoryWithSpecifiedData<ILabData> implements ILabData {
    get SUB_TYPE(): STRUCTURE_LAB { return STRUCTURE_LAB; }
    get SWARM_TYPE(): SwarmType.SwarmLab { return SwarmType.SwarmLab; }
}

export class LinkMemory extends StructureMemoryWithSpecifiedData<ILinkData> implements ILinkData {
    get SUB_TYPE(): STRUCTURE_LINK { return STRUCTURE_LINK; }
    get SWARM_TYPE(): SwarmType.SwarmLink { return SwarmType.SwarmLink; }
}

export class NukerMemory extends StructureMemoryWithSpecifiedData<INukerData> implements INukerData {
    get SUB_TYPE(): STRUCTURE_NUKER { return STRUCTURE_NUKER; }
    get SWARM_TYPE(): SwarmType.SwarmNuker { return SwarmType.SwarmNuker; }
}

export class ObserverMemory extends StructureMemoryWithSpecifiedData<IObserverData> implements IObserverData {
    get SUB_TYPE(): STRUCTURE_OBSERVER { return STRUCTURE_OBSERVER; }
    get SWARM_TYPE(): SwarmType.SwarmObserver { return SwarmType.SwarmObserver; }
}

export class PortalMemory extends StructureMemoryWithSpecifiedData<IPortalData> implements IPortalData {
    get SUB_TYPE(): STRUCTURE_PORTAL { return STRUCTURE_PORTAL; }
    get SWARM_TYPE(): SwarmType.SwarmPortal { return SwarmType.SwarmPortal; }
}

export class PowerBankMemory extends StructureMemoryWithSpecifiedData<IPowerBankData> implements IPowerBankData {
    get SUB_TYPE(): STRUCTURE_POWER_BANK { return STRUCTURE_POWER_BANK; }
    get SWARM_TYPE(): SwarmType.SwarmPowerBank { return SwarmType.SwarmPowerBank; }
}

export class PowerSpawnMemory extends StructureMemoryWithSpecifiedData<IPowerSpawnData> implements IPowerSpawnData {
    get SUB_TYPE(): STRUCTURE_POWER_SPAWN { return STRUCTURE_POWER_SPAWN; }
    get SWARM_TYPE(): SwarmType.SwarmPowerSpawn { return SwarmType.SwarmPowerSpawn; }
}

export class RampartMemory extends StructureMemoryWithSpecifiedData<IRampartData> implements IRampartData {
    get SUB_TYPE(): STRUCTURE_RAMPART { return STRUCTURE_RAMPART; }
    get SWARM_TYPE(): SwarmType.SwarmRampart { return SwarmType.SwarmRampart; }
}

export class RoadMemory extends StructureMemoryWithSpecifiedData<IRoadData> implements IRoadData {
    get SUB_TYPE(): STRUCTURE_ROAD { return STRUCTURE_ROAD; }
    get SWARM_TYPE(): SwarmType.SwarmRoad { return SwarmType.SwarmRoad; }
}

export class SpawnMemory extends StructureMemoryWithSpecifiedData<ISpawnData> implements ISpawnData {
    get SUB_TYPE(): STRUCTURE_SPAWN { return STRUCTURE_SPAWN; }
    get SWARM_TYPE(): SwarmType.SwarmSpawn { return SwarmType.SwarmSpawn; }
}

export class StorageMemory extends StructureMemoryWithSpecifiedData<IStorageData> implements IStorageData {
    get SUB_TYPE(): STRUCTURE_STORAGE { return STRUCTURE_STORAGE; }
    get SWARM_TYPE(): SwarmType.SwarmStorage { return SwarmType.SwarmStorage; }
}

export class TerminalMemory extends StructureMemoryWithSpecifiedData<ITerminalData> implements ITerminalData {
    get SUB_TYPE(): STRUCTURE_TERMINAL { return STRUCTURE_TERMINAL; }
    get SWARM_TYPE(): SwarmType.SwarmTerminal { return SwarmType.SwarmTerminal; }
}

export class TowerMemory extends StructureMemoryWithSpecifiedData<ITowerData> implements ITowerData {
    get SUB_TYPE(): STRUCTURE_TOWER { return STRUCTURE_TOWER; }
    get SWARM_TYPE(): SwarmType.SwarmTower { return SwarmType.SwarmTower; }
}

export class WallMemory extends StructureMemoryWithSpecifiedData<IWallData> implements IWallData {
    get SUB_TYPE(): STRUCTURE_WALL { return STRUCTURE_WALL; }
    get SWARM_TYPE(): SwarmType.SwarmWall { return SwarmType.SwarmWall; }
}

export type StructureMemory = StructureMemoryWithSpecifiedData<TStructureData>