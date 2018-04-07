import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { StructureMemoryBase } from "SwarmMemory/StructureMemory";
import { SwarmStructure, SwarmContainer, SwarmExtractor, SwarmExtension, SwarmKeepersLair, SwarmLink, SwarmNuker, SwarmObserver, SwarmPortal, SwarmPowerBank, SwarmPowerSpawn, SwarmRampart, SwarmRoad, SwarmStorage, SwarmTerminal, SwarmWall } from "SwarmTypes/SwarmStructures/SwarmStructure";
import { RoomObjectMemoryBase } from "SwarmMemory/RoomObjectMemory";
import { SwarmRoomObject, SwarmTypeBase, ObjectBase, SwarmMineral, SwarmTombstone, SwarmResource, SwarmNuke } from "SwarmTypes/SwarmTypes";
import { profile } from "Tools/Profiler";
import { SwarmRoom } from "./SwarmRoom";
import { SwarmFlag } from "./SwarmFlag";
import { ConsulObject, SwarmConsul } from "Consuls/ConsulBase";
import { SwarmMemory } from "SwarmMemory/SwarmMemory";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { ControlConsul } from "Consuls/ControlConsul";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { SwarmSite } from "SwarmTypes/SwarmSite";
import { SwarmSource } from "SwarmTypes/SwarmSource";
import { SwarmController } from "SwarmTypes/SwarmStructures/SwarmController";
import { SwarmLab } from "SwarmTypes/SwarmStructures/SwarmLab";
import { SwarmSpawn } from "SwarmTypes/SwarmStructures/SwarmSpawn";
import { SwarmTower } from "SwarmTypes/SwarmStructures/SwarmTower";

const SWARM_OBJECTS: {
    [id: number]: {
        [id: number]: {
        }
    }
} = {}
SWARM_OBJECTS[SwarmDataType.Consul] = {};
SWARM_OBJECTS[SwarmDataType.Consul][ConsulType.Control] = ControlConsul;
SWARM_OBJECTS[SwarmDataType.Consul][ConsulType.Harvest] = HarvestConsul;


SWARM_OBJECTS[SwarmDataType.Creep] = {};
SWARM_OBJECTS[SwarmDataType.Creep][CreepType.Builder] = SwarmCreep;
SWARM_OBJECTS[SwarmDataType.Creep][CreepType.Defender] = SwarmCreep;
SWARM_OBJECTS[SwarmDataType.Creep][CreepType.Deliverer] = SwarmCreep;
SWARM_OBJECTS[SwarmDataType.Creep][CreepType.MineralHarvester] = SwarmCreep;
SWARM_OBJECTS[SwarmDataType.Creep][CreepType.None] = SwarmCreep;
SWARM_OBJECTS[SwarmDataType.Creep][CreepType.Repairer] = SwarmCreep;
SWARM_OBJECTS[SwarmDataType.Creep][CreepType.Retriever] = SwarmCreep;
SWARM_OBJECTS[SwarmDataType.Creep][CreepType.Scientist] = SwarmCreep;
SWARM_OBJECTS[SwarmDataType.Creep][CreepType.SourceHarvester] = SwarmCreep;
SWARM_OBJECTS[SwarmDataType.Creep][CreepType.Upgrader] = SwarmCreep;

SWARM_OBJECTS[SwarmDataType.Flag] = {};
SWARM_OBJECTS[SwarmDataType.Flag][FlagType.Construct] = SwarmFlag;
SWARM_OBJECTS[SwarmDataType.Flag][FlagType.None] = SwarmFlag;
SWARM_OBJECTS[SwarmDataType.Flag][FlagType.Position] = SwarmFlag;

SWARM_OBJECTS[SwarmDataType.Room] = {};
SWARM_OBJECTS[SwarmDataType.Room][RoomType.Ally] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.HarvestSupport] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.Hostile] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.KeepersLair] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.NeutralRoom] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.NonHostile] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.RCL1] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.RCL2] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.RCL3] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.RCL4] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.RCL5] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.RCL6] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.RCL7] = SwarmRoom;
SWARM_OBJECTS[SwarmDataType.Room][RoomType.RCL8] = SwarmRoom;

SWARM_OBJECTS[SwarmDataType.RoomObject] = {};
SWARM_OBJECTS[SwarmDataType.RoomObject][SwarmType.SwarmMineral] = SwarmMineral;
SWARM_OBJECTS[SwarmDataType.RoomObject][SwarmType.SwarmNuke] = SwarmNuke;
SWARM_OBJECTS[SwarmDataType.RoomObject][SwarmType.SwarmResource] = SwarmResource;
SWARM_OBJECTS[SwarmDataType.RoomObject][SwarmType.SwarmSite] = SwarmSite;
SWARM_OBJECTS[SwarmDataType.RoomObject][SwarmType.SwarmSource] = SwarmSource;
SWARM_OBJECTS[SwarmDataType.RoomObject][SwarmType.SwarmTombstone] = SwarmTombstone;

SWARM_OBJECTS[SwarmDataType.Structure] = {};
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_CONTAINER] = SwarmContainer;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_CONTROLLER] = SwarmController;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_EXTRACTOR] = SwarmExtractor;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_EXTENSION] = SwarmExtension;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_KEEPER_LAIR] = SwarmKeepersLair;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_LAB] = SwarmLab;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_LINK] = SwarmLink;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_NUKER] = SwarmNuker;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_OBSERVER] = SwarmObserver;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_PORTAL] = SwarmPortal;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_POWER_BANK] = SwarmPowerBank;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_POWER_SPAWN] = SwarmPowerSpawn;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_RAMPART] = SwarmRampart;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_ROAD] = SwarmRoad;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_SPAWN] = SwarmSpawn;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_STORAGE] = SwarmStorage;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_TERMINAL] = SwarmTerminal;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_TOWER] = SwarmTower;
SWARM_OBJECTS[SwarmDataType.Structure][STRUCTURE_WALL] = SwarmWall;

@profile
export class SwarmCreator {
    static CreateSwarmObject(dataType: SwarmDataTypeSansMaster, swarmType: SwarmType, subType: SwarmSubType) {
        switch (dataType) {
            case (SwarmDataType.Consul):
                switch (subType as ConsulType) {
                    case (ConsulType.Harvest): return new HarvestConsul();
                    case (ConsulType.Control): return new ControlConsul();
                }
            case (SwarmDataType.Creep): return new SwarmCreep();
            case (SwarmDataType.Flag): return new SwarmFlag();
            case (SwarmDataType.Room): return new SwarmRoom();
            case (SwarmDataType.RoomObject):
                switch (swarmType) {
                    case (SwarmType.SwarmMineral): return new SwarmMineral();
                    case (SwarmType.SwarmNuke): return new SwarmNuke();
                    case (SwarmType.SwarmResource): return new SwarmResource();
                    case (SwarmType.SwarmSource): return new SwarmSource();
                    case (SwarmType.SwarmSite): return new SwarmSite();
                    case (SwarmType.SwarmTombstone): return new SwarmTombstone();
                }
            case (SwarmDataType.Structure):
                switch (subType as StructureConstant) {
                    case (STRUCTURE_CONTAINER): return new SwarmContainer();
                    case (STRUCTURE_CONTROLLER): return new SwarmContainer();
                    case (STRUCTURE_EXTENSION): return new SwarmContainer();
                    case (STRUCTURE_EXTRACTOR): return new SwarmContainer();
                    case (STRUCTURE_KEEPER_LAIR): return new SwarmContainer();
                    case (STRUCTURE_LAB): return new SwarmContainer();
                    case (STRUCTURE_LINK): return new SwarmContainer();
                    case (STRUCTURE_NUKER): return new SwarmContainer();
                    case (STRUCTURE_OBSERVER): return new SwarmContainer();
                    case (STRUCTURE_PORTAL): return new SwarmContainer();
                    case (STRUCTURE_POWER_BANK): return new SwarmContainer();
                    case (STRUCTURE_POWER_SPAWN): return new SwarmContainer();
                    case (STRUCTURE_RAMPART): return new SwarmContainer();
                    case (STRUCTURE_ROAD): return new SwarmContainer();
                    case (STRUCTURE_SPAWN): return new SwarmContainer();
                    case (STRUCTURE_STORAGE): return new SwarmContainer();
                    case (STRUCTURE_TERMINAL): return new SwarmContainer();
                    case (STRUCTURE_TOWER): return new SwarmContainer();
                    case (STRUCTURE_WALL): return new SwarmContainer();
                }
        }

        throw new NotImplementedException("SwarmObject is not configured: dataType[" +
            dataType + '] - swarmType[' + swarmType + '] - subType[' + subType + ']');
    }

    /*
    static CreateNewSwarmObject<T extends Room | RoomObject, U extends SwarmMemoryTypes>(obj: T) {
        let swarmType = this.GetSwarmType(obj);
        let newObj = this.CreateSwarmObject(swarmType) as ObjectBase<U, T>;
        let newMem = this.CreateNewSwarmMemory(this.GetObjSaveID(obj), swarmType);
        newObj.AssignObject(obj, newMem as U);

        return newObj;
    }

    static GetObjSaveID(obj: Room | RoomObject): string {
        if ((obj as Room).name) {
            if (!(obj as StructureSpawn).structureType) {// Spawns are special case that have a name
                return (obj as Room).name; // Flags, Creeps, and Rooms
            }
        }

        return (obj as Structure).id;
    }

    static GetSwarmType(obj: Room | RoomObject | ConsulObject): SwarmType {
        if ((obj as ConsulObject).GetSwarmType) {
            return (obj as ConsulObject).GetSwarmType();
        }

        if ((obj as Room).name) {
            if ((obj as Creep).getActiveBodyparts) {
                return SwarmType.SwarmCreep;
            } else if ((obj as Flag).setColor) {
                return SwarmType.SwarmFlag;
            } else if ((obj as Room).visual) {
                return SwarmType.SwarmRoom;
            } else if ((obj as Structure).structureType) {
                return this.GetStructureSwarmType(obj as Structure);
            }
        }
        if ((obj as AnyStructure).structureType) {
            if ((obj as ConstructionSite).remove) {
                return SwarmType.SwarmSite;
            } else {
                return this.GetStructureSwarmType(obj as Structure);
            }
        }
        if ((obj as Source).energyCapacity) {
            return SwarmType.SwarmSource;
        } else if ((obj as Resource).resourceType) {
            return SwarmType.SwarmResource;
        } else if ((obj as Tombstone).deathTime) {
            return SwarmType.SwarmTombstone;
        } else if ((obj as Mineral).mineralType) {
            return SwarmType.SwarmMineral;
        } else if ((obj as Nuke).launchRoomName) {
            return SwarmType.SwarmNuke;
        }

        throw new NotImplementedException('Not an implemented RoomObject ' + JSON.stringify(obj));
    }

    protected static GetStructureSwarmType(structure: Structure) {
        switch (structure.structureType) {
            case (STRUCTURE_CONTAINER): return SwarmType.SwarmContainer;
            case (STRUCTURE_CONTROLLER): return SwarmType.SwarmController;
            case (STRUCTURE_EXTENSION): return SwarmType.SwarmExtension;
            case (STRUCTURE_EXTRACTOR): return SwarmType.SwarmExtractor;
            case (STRUCTURE_KEEPER_LAIR): return SwarmType.SwarmKeepersLair;
            case (STRUCTURE_LAB): return SwarmType.SwarmLab;
            case (STRUCTURE_LINK): return SwarmType.SwarmLink;
            case (STRUCTURE_NUKER): return SwarmType.SwarmNuker;
            case (STRUCTURE_OBSERVER): return SwarmType.SwarmObserver;
            case (STRUCTURE_PORTAL): return SwarmType.SwarmPortal;
            case (STRUCTURE_POWER_BANK): return SwarmType.SwarmPowerBank;
            case (STRUCTURE_POWER_SPAWN): return SwarmType.SwarmPowerSpawn;
            case (STRUCTURE_RAMPART): return SwarmType.SwarmRampart;
            case (STRUCTURE_ROAD): return SwarmType.SwarmRoad;
            case (STRUCTURE_SPAWN): return SwarmType.SwarmSpawn;
            case (STRUCTURE_STORAGE): return SwarmType.SwarmStorage;
            case (STRUCTURE_TERMINAL): return SwarmType.SwarmTerminal;
            case (STRUCTURE_TOWER): return SwarmType.SwarmTower;
            case (STRUCTURE_WALL): return SwarmType.SwarmWall;
        }
    }
    static CreateConsulMemory(mem: TConsulData): TConsulMemory {
        let newConsul: HarvestMemory | undefined;
        switch (mem.SUB_TYPE) {
            case (ConsulType.Harvest):
                newConsul = new HarvestMemory(mem);
        }

        return newConsul!;
    }
    static CreateConsulObject(consulType: ConsulType): TConsulTypes {
        let consul: TConsulTypes;
        switch (consulType) {
            case (ConsulType.Harvest):
                consul = new HarvestConsul();
                break;
            case (ConsulType.Control):
                consul = new ControlConsul();
                break;
            default:
                throw new NotImplementedException('Consul type not implemented.');
        }

        return consul;
    }
    static CreateSwarmMemory(mem: TBasicData) {
        let memType = mem.SWARM_TYPE;
        let newMemory: MemoryBase<TBasicData>;

        switch (memType as SwarmType) {
            case (SwarmType.SwarmContainer):
                newMemory = new ContainerMemory(mem as IContainerData);
                break;
            case (SwarmType.SwarmController):
                newMemory = new ControllerMemory(mem as IControllerData);
                break;
            case (SwarmType.SwarmCreep):
                newMemory = new CreepMemory(mem as ICreepData);
                break;
            case (SwarmType.SwarmExtension):
                newMemory = new ExtensionMemory(mem as IExtensionData);
                break;
            case (SwarmType.SwarmExtractor):
                newMemory = new ExtractorMemory(mem as IExtractorData);
                break;
            case (SwarmType.SwarmFlag):
                newMemory = new FlagMemory(mem as IFlagData);
                break;
            case (SwarmType.SwarmKeepersLair):
                newMemory = new KeepersLairMemory(mem as IKeepersLairData);
                break;
            case (SwarmType.SwarmLab):
                newMemory = new LabMemory(mem as ILabData);
                break;
            case (SwarmType.SwarmLink):
                newMemory = new LinkMemory(mem as ILinkData);
                break;
            case (SwarmType.SwarmMineral):
                newMemory = new MineralMemory(mem as IMineralData)
                break;
            case (SwarmType.SwarmNuke):
                newMemory = new NukeMemory(mem as INukeData)
                break;
            case (SwarmType.SwarmNuker):
                newMemory = new NukerMemory(mem as INukerData);
                break;
            case (SwarmType.SwarmObserver):
                newMemory = new ObserverMemory(mem as IObserverData);
                break;
            case (SwarmType.SwarmPortal):
                newMemory = new PortalMemory(mem as IPortalData);
                break;
            case (SwarmType.SwarmPowerBank):
                newMemory = new PowerBankMemory(mem as IPowerBankData);
                break;
            case (SwarmType.SwarmPowerSpawn):
                newMemory = new PowerSpawnMemory(mem as IPowerSpawnData);
                break;
            case (SwarmType.SwarmRampart):
                newMemory = new RampartMemory(mem as IRampartData);
                break;
            case (SwarmType.SwarmResource):
                newMemory = new ResourceMemory(mem as IResourceData);
                break;
            case (SwarmType.SwarmRoad):
                newMemory = new RoadMemory(mem as IRoadData);
                break;
            case (SwarmType.SwarmRoom):
                newMemory = new RoomMemory(mem as IRoomData);
                break;
            case (SwarmType.SwarmSite):
                newMemory = new ConstructionSiteMemory(mem as ISiteData);
                break;
            case (SwarmType.SwarmSource):
                newMemory = new SourceMemory(mem as ISourceData);
                break;
            case (SwarmType.SwarmSpawn):
                newMemory = new SpawnMemory(mem as ISpawnData);
                break;
            case (SwarmType.SwarmStorage):
                newMemory = new StorageMemory(mem as IStorageData);
                break;
            case (SwarmType.SwarmTerminal):
                newMemory = new TerminalMemory(mem as ITerminalData);
                break;
            case (SwarmType.SwarmTombstone):
                newMemory = new TombstoneMemory(mem as ITombstoneData);
                break;
            case (SwarmType.SwarmTower):
                newMemory = new TowerMemory(mem as ITowerData);
                break;
            case (SwarmType.SwarmWall):
                newMemory = new WallMemory(mem as IWallData);
                break;
            case (SwarmType.SwarmConsul):
                newMemory = this.CreateConsulMemory(mem as TConsulData);
        }

        return newMemory!;
    }
    static CreateSwarmObject<T extends SwarmMemoryTypes>(swarmType: SwarmType, subType?: string | number): ObjectBase<T, any> {
        let newObj: ObjectBase<any, any>;
        switch (swarmType) {
            case (SwarmType.Any):
                throw new NotImplementedException("Other data types have not yet been implemented");
            case (SwarmType.SwarmContainer):
                newObj = new SwarmContainer();
                break;
            case (SwarmType.SwarmController):
                newObj = new SwarmController();
                break;
            case (SwarmType.SwarmCreep):
                newObj = new SwarmCreep();
                break;
            case (SwarmType.SwarmExtension):
                newObj = new SwarmExtension();
                break;
            case (SwarmType.SwarmExtractor):
                newObj = new SwarmExtractor();
                break;
            case (SwarmType.SwarmFlag):
                newObj = new SwarmFlag();
                break;
            case (SwarmType.SwarmKeepersLair):
                newObj = new SwarmKeepersLair();
                break;
            case (SwarmType.SwarmLab):
                newObj = new SwarmLab();
                break;
            case (SwarmType.SwarmLink):
                newObj = new SwarmLink();
                break;
            case (SwarmType.SwarmMineral):
                newObj = new SwarmMineral();
                break;
            case (SwarmType.SwarmNuke):
                newObj = new SwarmNuke();
                break;
            case (SwarmType.SwarmNuker):
                newObj = new SwarmNuker();
                break;
            case (SwarmType.SwarmObserver):
                newObj = new SwarmObserver();
                break;
            case (SwarmType.SwarmPortal):
                newObj = new SwarmPortal();
                break;
            case (SwarmType.SwarmPowerBank):
                newObj = new SwarmPowerBank();
                break;
            case (SwarmType.SwarmPowerSpawn):
                newObj = new SwarmPowerSpawn();
                break;
            case (SwarmType.SwarmRampart):
                newObj = new SwarmRampart();
                break;
            case (SwarmType.SwarmResource):
                newObj = new SwarmResource();
                break;
            case (SwarmType.SwarmRoad):
                newObj = new SwarmRoad();
                break;
            case (SwarmType.SwarmRoom):
                newObj = new SwarmRoom();
                break;
            case (SwarmType.SwarmSite):
                newObj = new SwarmSite();
                break;
            case (SwarmType.SwarmSource):
                newObj = new SwarmSource();
                break;
            case (SwarmType.SwarmSpawn):
                newObj = new SwarmSpawn();
                break;
            case (SwarmType.SwarmStorage):
                newObj = new SwarmStorage();
                break;
            case (SwarmType.SwarmTerminal):
                newObj = new SwarmTerminal();
                break;
            case (SwarmType.SwarmTombstone):
                newObj = new SwarmTombstone();
                break;
            case (SwarmType.SwarmTower):
                newObj = new SwarmTower();
                break;
            case (SwarmType.SwarmWall):
                newObj = new SwarmWall();
                break;
            case (SwarmType.SwarmConsul):
                if (!subType) { throw new NotImplementedException('Consul subtype not implemented or something'); }
                newObj = this.CreateConsulObject(subType as ConsulType);
                break;
        }
        return newObj!;
    }
    static CreateNewSwarmMemory(id: string, swarmType: SwarmType) {
        let newMemory: MemoryBase<SwarmDataTypes>;
        switch (swarmType) {
            case (SwarmType.SwarmContainer):
                newMemory = new ContainerMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmContainer,
                    SUB_TYPE: STRUCTURE_CONTAINER,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmController):
                newMemory = new ControllerMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmController,
                    SUB_TYPE: STRUCTURE_CONTROLLER,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmCreep):
                newMemory = new CreepMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Creep,
                    SWARM_TYPE: SwarmType.SwarmCreep,
                    isActive: true,
                    SUB_TYPE: CreepType.NullModule,
                });
                break;
            case (SwarmType.SwarmExtension):
                newMemory = new ExtensionMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtension,
                    SUB_TYPE: STRUCTURE_EXTENSION,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmExtractor):
                newMemory = new ExtractorMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtractor,
                    SUB_TYPE: STRUCTURE_EXTRACTOR,
                    isActive: true,
                });
                break;
            case (SwarmType.SwarmFlag):
                newMemory = new FlagMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Flag,
                    SWARM_TYPE: SwarmType.SwarmFlag,
                    SUB_TYPE: FlagType.NullModule,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmKeepersLair):
                newMemory = new KeepersLairMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmKeepersLair,
                    SUB_TYPE: STRUCTURE_KEEPER_LAIR,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmLab):
                newMemory = new LabMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmLab,
                    SUB_TYPE: STRUCTURE_LAB,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmLink):
                newMemory = new LinkMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmLink,
                    SUB_TYPE: STRUCTURE_LINK,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmMineral):
                newMemory = new MineralMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmMineral,
                    SUB_TYPE: SwarmType.SwarmMineral,
                    isActive: true,

                    pileID: undefined,
                    creepID: undefined,
                    containerID: undefined,
                });
                break;
            case (SwarmType.SwarmNuke):
                newMemory = new NukeMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmNuke,
                    SUB_TYPE: SwarmType.SwarmNuke,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmNuker):
                newMemory = new NukerMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmNuker,
                    SUB_TYPE: STRUCTURE_NUKER,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmObserver):
                newMemory = new ObserverMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmObserver,
                    SUB_TYPE: STRUCTURE_OBSERVER,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmPortal):
                newMemory = new PortalMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmPortal,
                    SUB_TYPE: STRUCTURE_PORTAL,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmPowerBank):
                newMemory = new PowerBankMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmPowerBank,
                    SUB_TYPE: STRUCTURE_POWER_BANK,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmPowerSpawn):
                newMemory = new PowerSpawnMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmPowerSpawn,
                    SUB_TYPE: STRUCTURE_POWER_SPAWN,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmRampart):
                newMemory = new RampartMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmRampart,
                    SUB_TYPE: STRUCTURE_RAMPART,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmResource):
                newMemory = new ResourceMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmResource,
                    SUB_TYPE: SwarmType.SwarmResource,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmRoad):
                newMemory = new RoadMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmRoad,
                    SUB_TYPE: STRUCTURE_ROAD,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmRoom):
                newMemory = new RoomMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Room,
                    SWARM_TYPE: SwarmType.SwarmRoom,
                    SUB_TYPE: RoomType.NeutralRoom,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmSite):
                newMemory = new ConstructionSiteMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmSite,
                    SUB_TYPE: SwarmType.SwarmSite,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmSource):
                newMemory = new SourceMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmSource,
                    SUB_TYPE: SwarmType.SwarmSource,
                    isActive: true,

                    pileID: undefined,
                    creepID: undefined,
                    containerID: undefined,
                    linkID: undefined,
                    constructionID: undefined,
                });
                break;
            case (SwarmType.SwarmSpawn):
                newMemory = new SpawnMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmSpawn,
                    SUB_TYPE: STRUCTURE_SPAWN,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmStorage):
                newMemory = new StorageMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmStorage,
                    SUB_TYPE: STRUCTURE_STORAGE,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmTerminal):
                newMemory = new TerminalMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmTerminal,
                    SUB_TYPE: STRUCTURE_TERMINAL,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmTombstone):
                newMemory = new TombstoneMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmTombstone,
                    SUB_TYPE: SwarmType.SwarmTombstone,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmTower):
                newMemory = new TowerMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmTower,
                    SUB_TYPE: STRUCTURE_TOWER,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmWall):
                newMemory = new WallMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmWall,
                    SUB_TYPE: STRUCTURE_WALL,
                    isActive: true
                });
                break;
        }
        return newMemory!;
    }*/
//}