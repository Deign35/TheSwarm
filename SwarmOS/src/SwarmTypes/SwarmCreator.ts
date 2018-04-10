import { ControlConsul } from "Consuls/ControlConsul";
import { HarvestConsul } from "Consuls/HarvestConsul";
import { SwarmCreep, SwarmCreep_Base } from "SwarmTypes/SwarmCreep";
import { SwarmFlag, SwarmFlag_Base } from "SwarmTypes/SwarmFlag";
import { SwarmRoom, SwarmRoom_Base } from "SwarmTypes/SwarmRoom";
import { SwarmMineral, SwarmNuke, SwarmResource, SwarmSite, SwarmSource, SwarmTombstone } from "SwarmTypes/SwarmRoomObjects";
import { SwarmContainer, SwarmExtractor, SwarmExtension, SwarmKeepersLair, SwarmLink, SwarmObserver, SwarmNuker, SwarmPortal, SwarmPowerBank, SwarmPowerSpawn, SwarmRampart, SwarmRoad, SwarmStorage, SwarmTerminal, SwarmWall } from "./SwarmStructures/SwarmStructure";
import { SwarmController } from "./SwarmStructures/SwarmController";
import { SwarmLab } from "./SwarmStructures/SwarmLab";
import { SwarmSpawn } from "./SwarmStructures/SwarmSpawn";
import { SwarmTower } from "./SwarmStructures/SwarmTower";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { profile } from "Tools/Profiler";
import { ConsulObject, SwarmConsul } from "Consuls/ConsulBase";
import { MemoryBase, MemoryObject } from "SwarmMemory/SwarmMemory";
import { ObjBase } from "./SwarmTypes";

@profile
export class SwarmCreator {
    static CreateNewSwarmMemory(id: string, swarmType: SwarmType): MemoryObject {
        let newMemory: any;
        switch (swarmType) {
            case (SwarmType.SwarmContainer):
                newMemory = new MemoryBase<IContainerData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmContainer,
                    SUB_TYPE: STRUCTURE_CONTAINER,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmController):
                newMemory = new MemoryBase<IControllerData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmController,
                    SUB_TYPE: STRUCTURE_CONTROLLER,
                    isActive: true,
                    creeps: [],
                    allowance: 0
                });
                break;
            case (SwarmType.SwarmCreep):
                newMemory = new MemoryBase<TCreepData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Creep,
                    SWARM_TYPE: SwarmType.SwarmCreep,
                    isActive: true,
                    SUB_TYPE: CreepType.None,
                });
                break;
            case (SwarmType.SwarmExtension):
                newMemory = new MemoryBase<IExtensionData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtension,
                    SUB_TYPE: STRUCTURE_EXTENSION,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmExtractor):
                newMemory = new MemoryBase<IExtractorData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtractor,
                    SUB_TYPE: STRUCTURE_EXTRACTOR,
                    isActive: true,
                });
                break;
            case (SwarmType.SwarmFlag):
                newMemory = new MemoryBase<TFlagData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Flag,
                    SWARM_TYPE: SwarmType.SwarmFlag,
                    SUB_TYPE: FlagType.None,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmKeepersLair):
                newMemory = new MemoryBase<IKeepersLairData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmKeepersLair,
                    SUB_TYPE: STRUCTURE_KEEPER_LAIR,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmLab):
                newMemory = new MemoryBase<ILabData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmLab,
                    SUB_TYPE: STRUCTURE_LAB,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmLink):
                newMemory = new MemoryBase<ILinkData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmLink,
                    SUB_TYPE: STRUCTURE_LINK,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmMineral):
                newMemory = new MemoryBase<IMineralData>({
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
                newMemory = new MemoryBase<INukeData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmNuke,
                    SUB_TYPE: SwarmType.SwarmNuke,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmNuker):
                newMemory = new MemoryBase<INukerData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmNuker,
                    SUB_TYPE: STRUCTURE_NUKER,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmObserver):
                newMemory = new MemoryBase<IObserverData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmObserver,
                    SUB_TYPE: STRUCTURE_OBSERVER,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmPortal):
                newMemory = new MemoryBase<IPortalData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmPortal,
                    SUB_TYPE: STRUCTURE_PORTAL,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmPowerBank):
                newMemory = new MemoryBase<IPowerBankData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmPowerBank,
                    SUB_TYPE: STRUCTURE_POWER_BANK,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmPowerSpawn):
                newMemory = new MemoryBase<IPowerSpawnData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmPowerSpawn,
                    SUB_TYPE: STRUCTURE_POWER_SPAWN,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmRampart):
                newMemory = new MemoryBase<IRampartData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmRampart,
                    SUB_TYPE: STRUCTURE_RAMPART,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmResource):
                newMemory = new MemoryBase<IResourceData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmResource,
                    SUB_TYPE: SwarmType.SwarmResource,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmRoad):
                newMemory = new MemoryBase<IRoadData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmRoad,
                    SUB_TYPE: STRUCTURE_ROAD,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmRoom):
                newMemory = new MemoryBase<TRoomData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Room,
                    SWARM_TYPE: SwarmType.SwarmRoom,
                    SUB_TYPE: RoomType.NeutralRoom,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmSite):
                newMemory = new MemoryBase<ISiteData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmSite,
                    SUB_TYPE: SwarmType.SwarmSite,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmSource):
                newMemory = new MemoryBase<ISourceData>({
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
                newMemory = new MemoryBase<ISpawnData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmSpawn,
                    SUB_TYPE: STRUCTURE_SPAWN,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmStorage):
                newMemory = new MemoryBase<IStorageData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmStorage,
                    SUB_TYPE: STRUCTURE_STORAGE,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmTerminal):
                newMemory = new MemoryBase<ITerminalData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmTerminal,
                    SUB_TYPE: STRUCTURE_TERMINAL,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmTombstone):
                newMemory = new MemoryBase<ITombstoneData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmTombstone,
                    SUB_TYPE: SwarmType.SwarmTombstone,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmTower):
                newMemory = new MemoryBase<ITowerData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmTower,
                    SUB_TYPE: STRUCTURE_TOWER,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmWall):
                newMemory = new MemoryBase<IWallData>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmWall,
                    SUB_TYPE: STRUCTURE_WALL,
                    isActive: true
                });
                break;
        }
        return newMemory;
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
    static GetDefaultSwarmSubType(swarmType: SwarmType): SwarmSubType {
        switch (swarmType) {
            case (SwarmType.SwarmRoom): return RoomType.NeutralRoom;
            case (SwarmType.SwarmCreep):
                SwarmLogger.LogWarning('DefaultSwarmSubType for Creep is being called unexpectedly');
                return CreepType.None;
            case (SwarmType.SwarmConsul): return ConsulType.None;
            case (SwarmType.SwarmFlag): return FlagType.None;
            case (SwarmType.SwarmMineral):
            case (SwarmType.SwarmNuke):
            case (SwarmType.SwarmResource):
            case (SwarmType.SwarmSource):
            case (SwarmType.SwarmSite):
            case (SwarmType.SwarmTombstone):
                return swarmType;
            default:
                return this.GetStructureSubType(swarmType);

        }
    }
    protected static GetStructureSubType(swarmType: SwarmType): StructureConstant {
        switch (swarmType) {
            case (SwarmType.SwarmContainer): return STRUCTURE_CONTAINER;
            case (SwarmType.SwarmController): return STRUCTURE_CONTROLLER;
            case (SwarmType.SwarmExtension): return STRUCTURE_EXTENSION;
            case (SwarmType.SwarmExtractor): return STRUCTURE_EXTRACTOR;
            case (SwarmType.SwarmKeepersLair): return STRUCTURE_KEEPER_LAIR;
            case (SwarmType.SwarmLab): return STRUCTURE_LAB;
            case (SwarmType.SwarmLink): return STRUCTURE_LINK;
            case (SwarmType.SwarmNuker): return STRUCTURE_NUKER;
            case (SwarmType.SwarmObserver): return STRUCTURE_OBSERVER;
            case (SwarmType.SwarmPortal): return STRUCTURE_PORTAL;
            case (SwarmType.SwarmPowerBank): return STRUCTURE_POWER_BANK;
            case (SwarmType.SwarmPowerSpawn): return STRUCTURE_POWER_SPAWN;
            case (SwarmType.SwarmRampart): return STRUCTURE_RAMPART;
            case (SwarmType.SwarmRoad): return STRUCTURE_ROAD;
            case (SwarmType.SwarmSpawn): return STRUCTURE_SPAWN;
            case (SwarmType.SwarmStorage): return STRUCTURE_STORAGE;
            case (SwarmType.SwarmTerminal): return STRUCTURE_TERMINAL;
            case (SwarmType.SwarmTower): return STRUCTURE_TOWER;
            case (SwarmType.SwarmWall): return STRUCTURE_WALL;
        }

        throw new NotImplementedException('Swarm type is not a structure: ' + swarmType);
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
    static CreateSwarmObject(obj: SwarmObjectType, mem: MemoryObject): ObjBase {
        let swarmType = mem.SWARM_TYPE;
        let subType = mem.SUB_TYPE;

        let newObj: ObjBase
        switch (swarmType) {
            case (SwarmType.None):
                throw new NotImplementedException("Other data types have not yet been implemented");
            case (SwarmType.SwarmContainer):
                newObj = new SwarmContainer(mem, obj as StructureContainer);
                break;
            case (SwarmType.SwarmController):
                newObj = new SwarmController(mem, obj as StructureController);
                break;
            case (SwarmType.SwarmCreep):
                newObj = new SwarmCreep_Base(mem, obj as Creep);
                break;
            case (SwarmType.SwarmExtension):
                newObj = new SwarmExtension(mem, obj as StructureExtension);
                break;
            case (SwarmType.SwarmExtractor):
                newObj = new SwarmExtractor(mem, obj as StructureExtractor);
                break;
            case (SwarmType.SwarmFlag):
                newObj = new SwarmFlag_Base(mem, obj as Flag);
                break;
            case (SwarmType.SwarmKeepersLair):
                newObj = new SwarmKeepersLair(mem, obj as StructureKeeperLair);
                break;
            case (SwarmType.SwarmLab):
                newObj = new SwarmLab(mem, obj as StructureLab);
                break;
            case (SwarmType.SwarmLink):
                newObj = new SwarmLink(mem, obj as StructureLink);
                break;
            case (SwarmType.SwarmMineral):
                newObj = new SwarmMineral(mem, obj as Mineral);
                break;
            case (SwarmType.SwarmNuke):
                newObj = new SwarmNuke(mem, obj as Nuke);
                break;
            case (SwarmType.SwarmNuker):
                newObj = new SwarmNuker(mem, obj as StructureNuker);
                break;
            case (SwarmType.SwarmObserver):
                newObj = new SwarmObserver(mem, obj as StructureObserver);
                break;
            case (SwarmType.SwarmPortal):
                newObj = new SwarmPortal(mem, obj as StructurePortal);
                break;
            case (SwarmType.SwarmPowerBank):
                newObj = new SwarmPowerBank(mem, obj as StructurePowerBank);
                break;
            case (SwarmType.SwarmPowerSpawn):
                newObj = new SwarmPowerSpawn(mem, obj as StructurePowerSpawn);
                break;
            case (SwarmType.SwarmRampart):
                newObj = new SwarmRampart(mem, obj as StructureRampart);
                break;
            case (SwarmType.SwarmResource):
                newObj = new SwarmResource(mem, obj as Resource);
                break;
            case (SwarmType.SwarmRoad):
                newObj = new SwarmRoad(mem, obj as StructureRoad);
                break;
            case (SwarmType.SwarmRoom):
                newObj = new SwarmRoom_Base(mem, obj as Room);
                break;
            case (SwarmType.SwarmSite):
                newObj = new SwarmSite(mem, obj as ConstructionSite);
                break;
            case (SwarmType.SwarmSource):
                newObj = new SwarmSource(mem, obj as Source);
                break;
            case (SwarmType.SwarmSpawn):
                newObj = new SwarmSpawn(mem, obj as StructureSpawn);
                break;
            case (SwarmType.SwarmStorage):
                newObj = new SwarmStorage(mem, obj as StructureStorage);
                break;
            case (SwarmType.SwarmTerminal):
                newObj = new SwarmTerminal(mem, obj as StructureTerminal);
                break;
            case (SwarmType.SwarmTombstone):
                newObj = new SwarmTombstone(mem, obj as Tombstone);
                break;
            case (SwarmType.SwarmTower):
                newObj = new SwarmTower(mem, obj as StructureTower);
                break;
            case (SwarmType.SwarmWall):
                newObj = new SwarmWall(mem, obj as StructureWall);
                break;
            case (SwarmType.SwarmConsul):
                newObj = this.CreateConsulObject(mem, obj as ConsulObject);
                break;
            default:
                throw new NotImplementedException('SwarmType is not implemented');
        }

        return newObj!;
    }

    static CreateConsulObject(mem: MemoryObject, obj: ConsulObject): ObjBase {
        let subType = mem.SUB_TYPE;
        switch (subType) {
            case (ConsulType.Control): return new ControlConsul(mem, obj)
            case (ConsulType.Harvest): return new HarvestConsul(mem, obj);
        }

        throw new NotImplementedException("Consul type is not configured: ' + subType");
    }
}