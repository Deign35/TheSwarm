import { profile } from "Tools/Profiler";
import { StructureMemory, CreepMemory, FlagMemory, RoomObjectMemory, RoomMemory } from "SwarmMemory/StorageMemory";
import { SwarmController } from "SwarmTypes/SwarmStructures/SwarmController";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { SwarmExtension, SwarmExtractor, SwarmLink, SwarmNuker, SwarmObserver, SwarmRampart, SwarmRoad, SwarmStorage, SwarmTerminal, SwarmWall, SwarmKeepersLair, SwarmPortal, SwarmPowerBank, SwarmPowerSpawn, SwarmContainer } from "SwarmTypes/SwarmStructures/SwarmStructure";
import { SwarmFlag } from "SwarmTypes/SwarmFlag";
import { SwarmLab } from "SwarmTypes/SwarmStructures/SwarmLab";
import { SwarmMineral, SwarmNuke, SwarmResource, SwarmTombstone, ObjectBase } from "SwarmTypes/SwarmTypes";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";
import { SwarmSite } from "SwarmTypes/SwarmSite";
import { SwarmSource } from "SwarmTypes/SwarmSource";
import { SwarmSpawn } from "SwarmTypes/SwarmStructures/SwarmSpawn";
import { SwarmTower } from "SwarmTypes/SwarmStructures/SwarmTower";
import { NotImplementedException } from "Tools/SwarmExceptions";

var SwarmObjectInstances = {}

@profile
export class SwarmCreator {
    /*static CreateNewSwarmObject<T extends Room | RoomObject, U extends SwarmMemoryTypes>(obj: T) {
        let swarmType = this.GetSwarmType(obj);
        let newObj = this.CreateSwarmObject(swarmType);
        let newMem = this.CreateNewSwarmMemory(this.GetObjSaveID(obj), swarmType);
        newObj.AssignObject(obj, newMem);

        return newObj;
    }*/

    static GetObjSaveID(obj: Room | RoomObject): string {
        if ((obj as Room).name) {
            if (!(obj as StructureSpawn).structureType) {// Spawns are special case that have a name
                return (obj as Room).name; // Flags, Creeps, and Rooms
            }
        }

        return (obj as Structure).id;
    }

    static GetSwarmType(obj: Room | RoomObject): SwarmType {
        if ((obj as Room).name) {
            if ((obj as Creep).getActiveBodyparts) {
                return SwarmType.SwarmCreep;
            } else if ((obj as Flag).setColor) {
                return SwarmType.SwarmFlag;
            } else if ((obj as Room).mode) {
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
    static CreateSwarmMemory(mem: TBasicSwarmData) {
        let memType = mem.SWARM_TYPE;
        let newMemory: SwarmMemoryTypes;

        switch (memType as SwarmType) {
            case (SwarmType.SwarmContainer):
                newMemory = new StructureMemory<SwarmType.SwarmContainer, IContainerData>(mem as IContainerData);
                break;
            case (SwarmType.SwarmController):
                newMemory = new StructureMemory<SwarmType.SwarmController, IControllerData>(mem as IControllerData);
                break;
            case (SwarmType.SwarmCreep):
                newMemory = new CreepMemory(mem as ICreepData);
                break;
            case (SwarmType.SwarmExtension):
                newMemory = new StructureMemory<SwarmType.SwarmExtension, IExtensionData>(mem as IExtensionData);
                break;
            case (SwarmType.SwarmExtractor):
                newMemory = new StructureMemory<SwarmType.SwarmExtractor, IExtractorData>(mem as IExtractorData);
                break;
            case (SwarmType.SwarmFlag):
                newMemory = new FlagMemory(mem as IFlagData);
                break;
            case (SwarmType.SwarmKeepersLair):
                newMemory = new StructureMemory<SwarmType.SwarmKeepersLair, IKeepersLairData>(mem as IKeepersLairData);
                break;
            case (SwarmType.SwarmLab):
                newMemory = new StructureMemory<SwarmType.SwarmLab, ILabData>(mem as ILabData);
                break;
            case (SwarmType.SwarmLink):
                newMemory = new StructureMemory<SwarmType.SwarmLink, ILinkData>(mem as ILinkData);
                break;
            case (SwarmType.SwarmMineral):
                newMemory = new RoomObjectMemory(mem as IMineralData)
                break;
            case (SwarmType.SwarmNuke):
                newMemory = new RoomObjectMemory(mem as TNukeData)
                break;
            case (SwarmType.SwarmNuker):
                newMemory = new StructureMemory<SwarmType.SwarmNuker, INukerData>(mem as INukerData);
                break;
            case (SwarmType.SwarmObserver):
                newMemory = new StructureMemory<SwarmType.SwarmObserver, IObserverData>(mem as IObserverData);
                break;
            case (SwarmType.SwarmPortal):
                newMemory = new StructureMemory<SwarmType.SwarmPortal, IPortalData>(mem as IPortalData);
                break;
            case (SwarmType.SwarmPowerBank):
                newMemory = new StructureMemory<SwarmType.SwarmPowerBank, IPowerBankData>(mem as IPowerBankData);
                break;
            case (SwarmType.SwarmPowerSpawn):
                newMemory = new StructureMemory<SwarmType.SwarmPowerSpawn, IPowerSpawnData>(mem as IPowerSpawnData);
                break;
            case (SwarmType.SwarmRampart):
                newMemory = new StructureMemory<SwarmType.SwarmRampart, IRampartData>(mem as IRampartData);
                break;
            case (SwarmType.SwarmResource):
                newMemory = new RoomObjectMemory(mem as TResourceData);
            case (SwarmType.SwarmRoad):
                newMemory = new StructureMemory<SwarmType.SwarmRoad, IRoadData>(mem as IRoadData);
                break;
            case (SwarmType.SwarmRoom):
                newMemory = new RoomMemory(mem as IRoomData);
                break;
            case (SwarmType.SwarmSite):
                newMemory = new RoomObjectMemory(mem as TConstructionSiteData);
                break;
            case (SwarmType.SwarmSource):
                newMemory = new RoomObjectMemory(mem as ISourceData);
                break;
            case (SwarmType.SwarmSpawn):
                newMemory = new StructureMemory<SwarmType.SwarmSpawn, ISpawnData>(mem as ISpawnData);
                break;
            case (SwarmType.SwarmStorage):
                newMemory = new StructureMemory<SwarmType.SwarmStorage, IStorageData>(mem as IStorageData);
                break;
            case (SwarmType.SwarmTerminal):
                newMemory = new StructureMemory<SwarmType.SwarmTerminal, ITerminalData>(mem as ITerminalData);
                break;
            case (SwarmType.SwarmTombstone):
                newMemory = new RoomObjectMemory(mem as TTombstoneData);
                break;
            case (SwarmType.SwarmTower):
                newMemory = new StructureMemory<SwarmType.SwarmTower, ITowerData>(mem as ITowerData);
                break;
            case (SwarmType.SwarmWall):
                newMemory = new StructureMemory<SwarmType.SwarmWall, IWallData>(mem as IWallData);
                break;
        }

        return newMemory!;
    }
    static CreateSwarmObject<T extends TSwarmObject>(swarmType: SwarmType): T {
        let newObj: IObject<any, any>;
        switch (swarmType) {
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
        }
        return newObj! as T;
    }
    static CreateNewSwarmMemory(id: string, swarmType: SwarmType) {
        let newMemory: SwarmMemoryTypes;
        switch (swarmType) {
            case (SwarmType.SwarmContainer):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmContainer,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmController):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmController,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmCreep):
                newMemory = new CreepMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Creep,
                    SWARM_TYPE: SwarmType.SwarmCreep,
                    isActive: true,
                    CREEP_TYPE: 0
                });
                break;
            case (SwarmType.SwarmExtension):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtension,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmExtractor):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtractor,
                    isActive: true,
                });
                break;
            case (SwarmType.SwarmFlag):
                newMemory = new FlagMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Flag,
                    SWARM_TYPE: SwarmType.SwarmFlag,
                    FLG_TYPE: 0,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmKeepersLair):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmKeepersLair,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmLab):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmLab,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmLink):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmLink,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmMineral):
                newMemory = new RoomObjectMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmMineral,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmNuke):
                newMemory = new RoomObjectMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmNuke,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmNuker):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmNuker,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmObserver):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmObserver,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmPortal):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmPortal,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmPowerBank):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmPowerBank,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmPowerSpawn):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmPowerSpawn,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmRampart):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmRampart,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmResource):
                newMemory = new RoomObjectMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmResource,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmRoad):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmRoad,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmRoom):
                newMemory = new RoomMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Room,
                    SWARM_TYPE: SwarmType.SwarmRoom,
                    RM_TYPE: 0,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmSite):
                newMemory = new RoomObjectMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmSite,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmSource):
                newMemory = new RoomObjectMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmSource,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmSpawn):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmSpawn,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmStorage):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmStorage,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmTerminal):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmTerminal,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmTombstone):
                newMemory = new RoomObjectMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmTombstone,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmTower):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmTower,
                    isActive: true
                });
                break;
            case (SwarmType.SwarmWall):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmWall,
                    isActive: true
                });
                break;
        }
        return newMemory!;
    }
}