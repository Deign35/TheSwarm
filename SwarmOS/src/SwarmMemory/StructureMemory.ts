import { profile } from "Tools/Profiler";
import { SwarmMemoryBase } from "SwarmMemory/SwarmMemory";
import { NotImplementedException } from "Tools/SwarmExceptions";



@profile
export abstract class StructureMemoryBase<T extends SwarmStructureType, U extends StructureConstant>
    extends SwarmMemoryBase<SwarmDataType.Structure, T, U> implements IStructureData<T, U> {
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
}

@profile
export class ContainerMemory extends StructureMemoryBase<SwarmType.SwarmContainer,
STRUCTURE_CONTAINER> implements IContainerData {
    get SWARM_TYPE(): SwarmType.SwarmContainer { return SwarmType.SwarmContainer; }
}
@profile
export class ControllerMemory extends StructureMemoryBase<SwarmType.SwarmController,
STRUCTURE_CONTROLLER> implements IControllerData {
    get SWARM_TYPE(): SwarmType.SwarmController { return SwarmType.SwarmController; }
}
@profile
export class ExtensionMemory extends StructureMemoryBase<SwarmType.SwarmExtension,
STRUCTURE_EXTENSION> implements IExtensionData {
    get SWARM_TYPE(): SwarmType.SwarmExtension { return SwarmType.SwarmExtension; }
}
@profile
export class ExtractorMemory extends StructureMemoryBase<SwarmType.SwarmExtractor,
STRUCTURE_EXTRACTOR> implements IExtractorData {
    get SWARM_TYPE(): SwarmType.SwarmExtractor { return SwarmType.SwarmExtractor; }
}
@profile
export class KeepersLairMemory extends StructureMemoryBase<SwarmType.SwarmKeepersLair,
STRUCTURE_KEEPER_LAIR> implements IKeepersLairData {
    get SWARM_TYPE(): SwarmType.SwarmKeepersLair { return SwarmType.SwarmKeepersLair; }
}
@profile
export class LabMemory extends StructureMemoryBase<SwarmType.SwarmLab, STRUCTURE_LAB> implements ILabData {
    get SWARM_TYPE(): SwarmType.SwarmLab { return SwarmType.SwarmLab; }
}
@profile
export class LinkMemory extends StructureMemoryBase<SwarmType.SwarmLink, STRUCTURE_LINK> implements ILinkData {
    get SWARM_TYPE(): SwarmType.SwarmLink { return SwarmType.SwarmLink; }
}
@profile
export class NukerMemory extends StructureMemoryBase<SwarmType.SwarmNuker, STRUCTURE_NUKER> implements INukerData {
    get SWARM_TYPE(): SwarmType.SwarmNuker { return SwarmType.SwarmNuker; }
}
@profile
export class ObserverMemory extends StructureMemoryBase<SwarmType.SwarmObserver, STRUCTURE_OBSERVER> implements IObserverData {
    get SWARM_TYPE(): SwarmType.SwarmObserver { return SwarmType.SwarmObserver; }
}
@profile
export class PortalMemory extends StructureMemoryBase<SwarmType.SwarmPortal, STRUCTURE_PORTAL> implements IPortalData {
    get SWARM_TYPE(): SwarmType.SwarmPortal { return SwarmType.SwarmPortal; }
}
@profile
export class PowerBankMemory extends StructureMemoryBase<SwarmType.SwarmPowerBank,
STRUCTURE_POWER_BANK> implements IPowerBankData {
    get SWARM_TYPE(): SwarmType.SwarmPowerBank { return SwarmType.SwarmPowerBank; }
}
@profile
export class PowerSpawnMemory extends StructureMemoryBase<SwarmType.SwarmPowerSpawn,
STRUCTURE_POWER_SPAWN> implements IPowerSpawnData {
    get SWARM_TYPE(): SwarmType.SwarmPowerSpawn { return SwarmType.SwarmPowerSpawn; }
}
@profile
export class RampartMemory extends StructureMemoryBase<SwarmType.SwarmRampart,
STRUCTURE_RAMPART> implements IRampartData {
    get SWARM_TYPE(): SwarmType.SwarmRampart { return SwarmType.SwarmRampart; }
}
@profile
export class RoadMemory extends StructureMemoryBase<SwarmType.SwarmRoad, STRUCTURE_ROAD> implements IRoadData {
    get SWARM_TYPE(): SwarmType.SwarmRoad { return SwarmType.SwarmRoad; }
}
@profile
export class SpawnMemory extends StructureMemoryBase<SwarmType.SwarmSpawn, STRUCTURE_SPAWN> implements ISpawnData {
    get SWARM_TYPE(): SwarmType.SwarmSpawn { return SwarmType.SwarmSpawn; }
}
@profile
export class StorageMemory extends StructureMemoryBase<SwarmType.SwarmStorage, STRUCTURE_STORAGE> implements IStorageData {
    get SWARM_TYPE(): SwarmType.SwarmStorage { return SwarmType.SwarmStorage; }
}
@profile
export class TerminalMemory extends StructureMemoryBase<SwarmType.SwarmTerminal, STRUCTURE_TERMINAL> implements ITerminalData {
    get SWARM_TYPE(): SwarmType.SwarmTerminal { return SwarmType.SwarmTerminal; }
}
@profile
export class TowerMemory extends StructureMemoryBase<SwarmType.SwarmTower, STRUCTURE_TOWER> implements ITowerData {
    get SWARM_TYPE(): SwarmType.SwarmTower { return SwarmType.SwarmTower; }
}
@profile
export class WallMemory extends StructureMemoryBase<SwarmType.SwarmWall, STRUCTURE_WALL> implements IWallData {
    get SWARM_TYPE(): SwarmType.SwarmWall { return SwarmType.SwarmWall; }
}


export type StructureMemory = ContainerMemory | ControllerMemory | ExtensionMemory | ExtractorMemory | KeepersLairMemory |
    LabMemory | LinkMemory | NukerMemory | ObserverMemory | PortalMemory | PowerBankMemory | PowerSpawnMemory | RampartMemory |
    RoadMemory | SpawnMemory | StorageMemory | TerminalMemory | TowerMemory | WallMemory;