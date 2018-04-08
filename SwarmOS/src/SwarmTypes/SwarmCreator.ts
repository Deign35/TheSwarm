import { ControlConsul } from "Consuls/ControlConsul";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { SwarmFlag } from "SwarmTypes/SwarmFlag";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";
import { SwarmMineral, SwarmNuke, SwarmResource, SwarmSite, SwarmSource, SwarmTombstone } from "SwarmTypes/SwarmRoomObjects";
import { SwarmContainer, SwarmExtractor, SwarmExtension, SwarmKeepersLair, SwarmLink, SwarmObserver, SwarmNuker, SwarmPortal, SwarmPowerBank, SwarmPowerSpawn, SwarmRampart, SwarmRoad, SwarmStorage, SwarmTerminal, SwarmWall } from "./SwarmStructures/SwarmStructure";
import { SwarmController } from "./SwarmStructures/SwarmController";
import { SwarmLab } from "./SwarmStructures/SwarmLab";
import { SwarmSpawn } from "./SwarmStructures/SwarmSpawn";
import { SwarmTower } from "./SwarmStructures/SwarmTower";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { profile } from "Tools/Profiler";
import { SwarmMemoryBase, SwarmMemoryWithSpecifiedData, SwarmMemory } from "SwarmMemory/SwarmMemory";
import { ContainerMemory, ControllerMemory, ExtensionMemory, ExtractorMemory, KeepersLairMemory, LabMemory, LinkMemory, NukerMemory, ObserverMemory, PortalMemory, PowerBankMemory, PowerSpawnMemory, RampartMemory, RoadMemory, SpawnMemory, StorageMemory, TerminalMemory, TowerMemory, WallMemory } from "SwarmMemory/StructureMemory";
import { CreepMemory } from "SwarmMemory/CreepMemory";
import { FlagMemory } from "SwarmMemory/FlagMemory";
import { MineralMemory, NukeMemory, ResourceMemory, SiteMemory, SourceMemory, TombstoneMemory } from "SwarmMemory/RoomObjectMemory";
import { RoomMemory } from "SwarmMemory/RoomMemory";
import { HarvestConsulMemory, ControlConsulMemory, ConsulMemory } from "SwarmMemory/ConsulMemory";
import { ConsulObject } from "Consuls/ConsulBase";

@profile
export class SwarmCreator {
    static CreateNewSwarmMemory<T extends SwarmDataTypeSansMaster, U extends SwarmSubType, V extends SwarmType,
        X extends SwarmMemory>(id: string, swarmType: V): X {
        let newMemory: any;
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
                    SUB_TYPE: CreepType.None,
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
                    SUB_TYPE: FlagType.None,
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
                newMemory = new SiteMemory({
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
        return newMemory as X;
    }
    static CreateSwarmMemory<T extends SwarmDataTypeSansMaster, U extends SwarmType, V extends SwarmSubType,
        W extends SwarmData>(mem: SwarmData): SwarmMemoryWithSpecifiedData<W> {
        let memType = mem.SWARM_TYPE;
        let subType = mem.SUB_TYPE;

        let newMemory: any;

        switch (memType as SwarmType) {
            // Consuls
            case (SwarmType.SwarmConsul):
                switch (subType as ConsulType) {
                    case (ConsulType.Harvest): newMemory = new HarvestConsulMemory(mem as HarvestConsulData); break;
                    case (ConsulType.Control): newMemory = new ControlConsulMemory(mem as ControlConsulData); break;
                }
                break;
            // Creeps
            case (SwarmType.SwarmCreep):
                switch (subType as CreepType) {
                    default:
                        newMemory = new CreepMemory(mem as TCreepData);
                }
                break;
            // Flags
            case (SwarmType.SwarmFlag):
                switch (subType as FlagType) {
                    default:
                        newMemory = new FlagMemory(mem as TFlagData);
                }
                break;
            // Rooms
            case (SwarmType.SwarmRoom):
                newMemory = new RoomMemory(mem as TRoomData);
                break;

            //Sufficiently referenced objects by swarmtype alone
            // Structures & RoomObjects
            case (SwarmType.SwarmContainer):
                newMemory = new ContainerMemory(mem as IContainerData);
                break;
            case (SwarmType.SwarmController):
                newMemory = new ControllerMemory(mem as IControllerData);
                break;
            case (SwarmType.SwarmExtension):
                newMemory = new ExtensionMemory(mem as IExtensionData);
                break;
            case (SwarmType.SwarmExtractor):
                newMemory = new ExtractorMemory(mem as IExtractorData);
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
            case (SwarmType.SwarmSite):
                newMemory = new SiteMemory(mem as ISiteData);
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
        }

        return newMemory!;
    }

    static GetSwarmType(obj: SwarmObjectType): SwarmType {
        if ((obj as AIConsulObject).ConsulType) {
            return SwarmType.SwarmConsul;
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

    static GetObjSaveID(obj: SwarmObjectType): string {
        if ((obj as Room).name) {
            if (!(obj as StructureSpawn).structureType) {// Spawns are special case that have a name
                return (obj as Room).name; // Flags, Creeps, and Rooms
            }
        }

        return (obj as Structure).id;
    }
    static CreateSwarmObject(mem: SwarmMemory, obj: SwarmObjectType): AIObject {
        let swarmType: SwarmType = mem.SWARM_TYPE;
        let subType: SwarmSubType = mem.SUB_TYPE;
        let newObj: AIObject
        switch (swarmType) {
            case (SwarmType.None):
                throw new NotImplementedException("Other data types have not yet been implemented");
            case (SwarmType.SwarmContainer):
                newObj = new SwarmContainer(mem as ContainerMemory, obj as StructureContainer);
                break;
            case (SwarmType.SwarmController):
                newObj = new SwarmController(mem as ControllerMemory, obj as StructureController);
                break;
            case (SwarmType.SwarmCreep):
                newObj = new SwarmCreep(mem as CreepMemory, obj as Creep);
                break;
            case (SwarmType.SwarmExtension):
                newObj = new SwarmExtension(mem as ExtensionMemory, obj as StructureExtension);
                break;
            case (SwarmType.SwarmExtractor):
                newObj = new SwarmExtractor(mem as ExtractorMemory, obj as StructureExtractor);
                break;
            case (SwarmType.SwarmFlag):
                newObj = new SwarmFlag(mem as FlagMemory, obj as Flag);
                break;
            case (SwarmType.SwarmKeepersLair):
                newObj = new SwarmKeepersLair(mem as KeepersLairMemory, obj as StructureKeeperLair);
                break;
            case (SwarmType.SwarmLab):
                newObj = new SwarmLab(mem as LabMemory, obj as StructureLab);
                break;
            case (SwarmType.SwarmLink):
                newObj = new SwarmLink(mem as LinkMemory, obj as StructureLink);
                break;
            case (SwarmType.SwarmMineral):
                newObj = new SwarmMineral(mem as MineralMemory, obj as Mineral);
                break;
            case (SwarmType.SwarmNuke):
                newObj = new SwarmNuke(mem as NukeMemory, obj as Nuke);
                break;
            case (SwarmType.SwarmNuker):
                newObj = new SwarmNuker(mem as NukerMemory, obj as StructureNuker);
                break;
            case (SwarmType.SwarmObserver):
                newObj = new SwarmObserver(mem as ObserverMemory, obj as StructureObserver);
                break;
            case (SwarmType.SwarmPortal):
                newObj = new SwarmPortal(mem as PortalMemory, obj as StructurePortal);
                break;
            case (SwarmType.SwarmPowerBank):
                newObj = new SwarmPowerBank(mem as PowerBankMemory, obj as StructurePowerBank);
                break;
            case (SwarmType.SwarmPowerSpawn):
                newObj = new SwarmPowerSpawn(mem as PowerSpawnMemory, obj as StructurePowerSpawn);
                break;
            case (SwarmType.SwarmRampart):
                newObj = new SwarmRampart(mem as RampartMemory, obj as StructureRampart);
                break;
            case (SwarmType.SwarmResource):
                newObj = new SwarmResource(mem as ResourceMemory, obj as Resource);
                break;
            case (SwarmType.SwarmRoad):
                newObj = new SwarmRoad(mem as RoadMemory, obj as StructureRoad);
                break;
            case (SwarmType.SwarmRoom):
                newObj = new SwarmRoom(mem as RoomMemory, obj as Room);
                break;
            case (SwarmType.SwarmSite):
                newObj = new SwarmSite(mem as SiteMemory, obj as ConstructionSite);
                break;
            case (SwarmType.SwarmSource):
                newObj = new SwarmSource(mem as SourceMemory, obj as Source);
                break;
            case (SwarmType.SwarmSpawn):
                newObj = new SwarmSpawn(mem as SpawnMemory, obj as StructureSpawn);
                break;
            case (SwarmType.SwarmStorage):
                newObj = new SwarmStorage(mem as StorageMemory, obj as StructureStorage);
                break;
            case (SwarmType.SwarmTerminal):
                newObj = new SwarmTerminal(mem as TerminalMemory, obj as StructureTerminal);
                break;
            case (SwarmType.SwarmTombstone):
                newObj = new SwarmTombstone(mem as TombstoneMemory, obj as Tombstone);
                break;
            case (SwarmType.SwarmTower):
                newObj = new SwarmTower(mem as TowerMemory, obj as StructureTower);
                break;
            case (SwarmType.SwarmWall):
                newObj = new SwarmWall(mem as WallMemory, obj as StructureWall);
                break;
            case (SwarmType.SwarmConsul):
                if (!subType) { throw new NotImplementedException('Consul subtype not implemented or something'); }
                newObj = this.CreateConsulObject(mem as ConsulMemory, obj);
                break;
        }
        return newObj!;
    }

    static CreateConsulObject(mem: ConsulMemory, obj: SwarmObjectType): AIConsul {
        let subType: SwarmSubType = mem.SUB_TYPE;
        switch (subType) {
            case (ConsulType.Control): return new ControlConsul(mem as ControlConsulMemory,
                obj as ConsulObject<ConsulType.Control>)
            case (ConsulType.Harvest): return new HarvestConsul(mem as HarvestConsulMemory,
                obj as ConsulObject<ConsulType.Harvest>);
        }

        throw new NotImplementedException("Consul type is not configured: ' + subType");
    }
}