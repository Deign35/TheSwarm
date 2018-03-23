import { profile } from "Tools/Profiler";
import { StructureMemory, CreepMemory, FlagMemory, RoomObjectMemory, RoomMemory } from "SwarmMemory/StorageMemory";
import { SwarmController } from "SwarmTypes/SwarmStructures/SwarmController";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { SwarmExtension, SwarmExtractor, SwarmLink, SwarmNuker, SwarmObserver, SwarmRampart, SwarmRoad, SwarmStorage, SwarmTerminal, SwarmWall, SwarmKeepersLair, SwarmPortal, SwarmPowerBank, SwarmPowerSpawn, SwarmContainer } from "SwarmTypes/SwarmStructures/SwarmStructure";
import { SwarmFlag } from "SwarmTypes/SwarmFlag";
import { SwarmLab } from "SwarmTypes/SwarmStructures/SwarmLab";
import { SwarmMineral, SwarmNuke, SwarmResource, SwarmTombstone } from "SwarmTypes/SwarmTypes";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";
import { SwarmSite } from "SwarmTypes/SwarmSite";
import { SwarmSource } from "SwarmTypes/SwarmSource";
import { SwarmSpawn } from "SwarmTypes/SwarmStructures/SwarmSpawn";
import { SwarmTower } from "SwarmTypes/SwarmStructures/SwarmTower";

var SwarmObjectInstances = {}

@profile
export class SwarmCreator {
    static CreateSwarmMemory(mem: TSwarmData) {
        let memType = mem.SWARM_TYPE;
        let newMemory: TMemory;

        switch (memType as SwarmType) {
            case (SwarmType.SwarmContainer):
                newMemory = new StructureMemory<SwarmType.SwarmContainer>(mem as TStructureData);
                break;
            case (SwarmType.SwarmController):
                newMemory = new StructureMemory<SwarmType.SwarmController>(mem as TStructureData);
                break;
            case (SwarmType.SwarmCreep):
                newMemory = new CreepMemory(mem as TCreepData);
                break;
            case (SwarmType.SwarmExtension):
                newMemory = new StructureMemory<SwarmType.SwarmExtension>(mem as TStructureData);
                break;
            case (SwarmType.SwarmExtractor):
                newMemory = new StructureMemory<SwarmType.SwarmExtractor>(mem as TStructureData);
                break;
            case (SwarmType.SwarmFlag):
                newMemory = new FlagMemory(mem as TFlagData);
                break;
            case (SwarmType.SwarmKeepersLair):
                newMemory = new StructureMemory<SwarmType.SwarmKeepersLair>(mem as TStructureData);
                break;
            case (SwarmType.SwarmLab):
                newMemory = new StructureMemory<SwarmType.SwarmLab>(mem as TStructureData);
                break;
            case (SwarmType.SwarmLink):
                newMemory = new StructureMemory<SwarmType.SwarmLink>(mem as TStructureData);
                break;
            case (SwarmType.SwarmMineral):
                newMemory = new RoomObjectMemory(mem as IMineralData)
                break;
            case (SwarmType.SwarmNuke):
                newMemory = new RoomObjectMemory(mem as TRoomObjectData)
                break;
            case (SwarmType.SwarmNuker):
                newMemory = new StructureMemory<SwarmType.SwarmNuker>(mem as TStructureData);
                break;
            case (SwarmType.SwarmObserver):
                newMemory = new StructureMemory<SwarmType.SwarmObserver>(mem as TStructureData);
                break;
            case (SwarmType.SwarmPortal):
                newMemory = new StructureMemory<SwarmType.SwarmPortal>(mem as TStructureData);
                break;
            case (SwarmType.SwarmPowerBank):
                newMemory = new StructureMemory<SwarmType.SwarmPowerBank>(mem as TStructureData);
                break;
            case (SwarmType.SwarmPowerSpawn):
                newMemory = new StructureMemory<SwarmType.SwarmPowerSpawn>(mem as TStructureData);
                break;
            case (SwarmType.SwarmRampart):
                newMemory = new StructureMemory<SwarmType.SwarmRampart>(mem as TStructureData);
                break;
            case (SwarmType.SwarmResource):
                newMemory = new RoomObjectMemory(mem as TRoomObjectData);
            case (SwarmType.SwarmRoad):
                newMemory = new StructureMemory<SwarmType.SwarmRoad>(mem as TStructureData);
                break;
            case (SwarmType.SwarmRoom):
                newMemory = new RoomMemory(mem as TRoomData);
                break;
            case (SwarmType.SwarmSite):
                newMemory = new RoomObjectMemory(mem as TRoomObjectData);
                break;
            case (SwarmType.SwarmSource):
                newMemory = new RoomObjectMemory(mem as ISourceData);
                break;
            case (SwarmType.SwarmSpawn):
                newMemory = new StructureMemory<SwarmType.SwarmSpawn>(mem as TStructureData);
                break;
            case (SwarmType.SwarmStorage):
                newMemory = new StructureMemory<SwarmType.SwarmStorage>(mem as TStructureData);
                break;
            case (SwarmType.SwarmTerminal):
                newMemory = new StructureMemory<SwarmType.SwarmTerminal>(mem as TStructureData);
                break;
            case (SwarmType.SwarmTombstone):
                newMemory = new RoomObjectMemory(mem as TRoomObjectData);
                break;
            case (SwarmType.SwarmTower):
                newMemory = new StructureMemory<SwarmType.SwarmTower>(mem as TStructureData);
                break;
            case (SwarmType.SwarmWall):
                newMemory = new StructureMemory<SwarmType.SwarmWall>(mem as TStructureData);
                break;
        }

        return newMemory!;
    }
    static CreateSwarmObject(swarmType: SwarmType) {
        let newObj: TObject;
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
        return newObj!;
    }
    static CreateNewSwarmMemory(id: string, swarmType: SwarmType) {
        let newMemory: TSwarmMemory;
        switch (swarmType) {
            case (SwarmType.SwarmContainer):
                newMemory = new StructureMemory<SwarmType.SwarmContainer>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmContainer
                });
                break;
            case (SwarmType.SwarmController):
                newMemory = new StructureMemory<SwarmType.SwarmController>({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmController
                });
                break;
            case (SwarmType.SwarmCreep):
                newMemory = new CreepMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Creep,
                    SWARM_TYPE: SwarmType.SwarmCreep,
                    CM_TYPE: CreepModuleType.NullModule
                });
                break;
            case (SwarmType.SwarmExtension):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtension
                });
                break;
            case (SwarmType.SwarmExtractor):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtractor
                });
                break;
            case (SwarmType.SwarmFlag):
                newMemory = new FlagMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Flag,
                    SWARM_TYPE: SwarmType.SwarmFlag,
                    FLG_TYPE: 0
                });
                break;
            case (SwarmType.SwarmKeepersLair):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmKeepersLair
                });
                break;
            case (SwarmType.SwarmLab):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmLab
                });
                break;
            case (SwarmType.SwarmLink):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmLink
                });
                break;
            case (SwarmType.SwarmMineral):
                newMemory = new RoomObjectMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmMineral,
                    RO_TYPE: 0
                });
                break;
            case (SwarmType.SwarmNuke):
                newMemory = new RoomObjectMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmNuke,
                    RO_TYPE: 0
                });
                break;
            case (SwarmType.SwarmNuker):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmNuker
                });
                break;
            case (SwarmType.SwarmObserver):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmObserver
                });
                break;
            case (SwarmType.SwarmPortal):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmPortal
                });
                break;
            case (SwarmType.SwarmPowerBank):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmPowerBank
                });
                break;
            case (SwarmType.SwarmPowerSpawn):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmPowerSpawn
                });
                break;
            case (SwarmType.SwarmRampart):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmRampart
                });
                break;
            case (SwarmType.SwarmResource):
                newMemory = new RoomObjectMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmResource,
                    RO_TYPE: 0
                });
                break;
            case (SwarmType.SwarmRoad):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmRoad
                });
                break;
            case (SwarmType.SwarmRoom):
                newMemory = new RoomMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Room,
                    SWARM_TYPE: SwarmType.SwarmRoom,
                    RM_TYPE: 0,
                    RoomObjects: {
                        MEM_TYPE: SwarmDataType.Master,
                        ChildData: {},
                        id: 'RoomObjects'
                    }
                });
                break;
            case (SwarmType.SwarmSite):
                newMemory = new RoomObjectMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmSite,
                    RO_TYPE: 0
                });
                break;
            case (SwarmType.SwarmSource):
                newMemory = new RoomObjectMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmSource,
                    RO_TYPE: 0
                });
                break;
            case (SwarmType.SwarmSpawn):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmSpawn
                });
                break;
            case (SwarmType.SwarmStorage):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmStorage
                });
                break;
            case (SwarmType.SwarmTerminal):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmTerminal
                });
                break;
            case (SwarmType.SwarmTombstone):
                newMemory = new RoomObjectMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmTombstone,
                    RO_TYPE: 0
                });
                break;
            case (SwarmType.SwarmTower):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmTower
                });
                break;
            case (SwarmType.SwarmWall):
                newMemory = new StructureMemory({
                    id: id,
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmWall
                });
                break;
        }
        return newMemory!;
    }
}