import { profile } from "Tools/Profiler";
import { SwarmContainer, SwarmExtension, SwarmExtractor, SwarmLink, SwarmNuker, SwarmObserver, SwarmRampart, SwarmRoad, SwarmStorage, SwarmTerminal, SwarmWall } from "./SwarmStructures/SwarmStructure";
import { StructureMemory, CreepMemory, FlagMemory, RoomObjectMemory, RoomMemory } from "Memory/StorageMemory";
import { SwarmController } from "SwarmTypes/SwarmStructures/SwarmController";
import { SwarmCreep } from "SwarmTypes/SwarmCreep";
import { SwarmFlag } from "SwarmTypes/SwarmFlag";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { SwarmLab } from "SwarmTypes/SwarmStructures/SwarmLab";
import { SwarmMineral, SwarmNuke, SwarmResource, SwarmTombstone, SwarmRoomObject } from "./SwarmTypes";
import { SwarmRoom } from "SwarmTypes/SwarmRoom";
import { SwarmSite } from "./SwarmSite";
import { SwarmSource } from "SwarmTypes/SwarmSource";
import { SwarmSpawn } from "./SwarmStructures/SwarmSpawn";
import { SwarmTower } from "./SwarmStructures/SwarmTower";

@profile
export class SwarmCreator {
    static CreateSwarmObject(obj: any, mem: IData) {
        let newObj: TObject;
        let memType = mem.MEM_TYPE;
        let newMemory: TMemory;
        switch (memType as SwarmType) {
            case (SwarmType.SwarmContainer):
                newObj = new SwarmController();
                newMemory = new StructureMemory<SwarmType.SwarmController>(mem as TStructureData);
                break;
            case (SwarmType.SwarmController):
                newObj = new SwarmController();
                newMemory = new StructureMemory<SwarmType.SwarmController>(mem as TStructureData);
                break;
            case (SwarmType.SwarmCreep):
                newObj = new SwarmCreep();
                newMemory = new CreepMemory(mem as TCreepData);
                break;
            case (SwarmType.SwarmExtension):
                newObj = new SwarmExtension();
                newMemory = new StructureMemory<SwarmType.SwarmExtension>(mem as TStructureData);
                break;
            case (SwarmType.SwarmExtractor):
                newObj = new SwarmExtractor();
                newMemory = new StructureMemory<SwarmType.SwarmExtractor>(mem as TStructureData);
                break;
            case (SwarmType.SwarmFlag):
                newObj = new SwarmFlag();
                newMemory = new FlagMemory(mem as TFlagData);
                break;
            case (SwarmType.SwarmLab):
                newObj = new SwarmLab();
                newMemory = new StructureMemory<SwarmType.SwarmLab>(mem as TStructureData);
                break;
            case (SwarmType.SwarmLink):
                newObj = new SwarmLink();
                newMemory = new StructureMemory<SwarmType.SwarmLink>(mem as TStructureData);
                break;
            case (SwarmType.SwarmMineral):
                newObj = new SwarmMineral();
                newMemory = new RoomObjectMemory(mem as IMineralData)
                break;
            case (SwarmType.SwarmNuke):
                newObj = new SwarmNuke();
                newMemory = new RoomObjectMemory(mem as TRoomObjectData)
                break;
            case (SwarmType.SwarmNuker):
                newObj = new SwarmNuker();
                newMemory = new StructureMemory<SwarmType.SwarmNuker>(mem as TStructureData);
                break;
            case (SwarmType.SwarmObserver):
                newObj = new SwarmObserver();
                newMemory = new StructureMemory<SwarmType.SwarmObserver>(mem as TStructureData);
                break;
            case (SwarmType.SwarmPortal):
                throw new NotImplementedException("SwarmPortal not implemented");
            /*newObj = new SwarmPortal();
            newMemory = new StructureMemory<SwarmType.SwarmPortal>(mem as TStructureData);
            break;*/
            case (SwarmType.SwarmPowerBank):
                throw new NotImplementedException("SwarmPowerBank not implemented");
            /*newObj = new SwarmPowerBank();
            newMemory = new StructureMemory<SwarmType.SwarmPowerBank>(mem as TStructureData);
            break;*/
            case (SwarmType.SwarmPowerSpawn):
                throw new NotImplementedException("SwarmPowerSpawn not implemented");
            /*newObj = new SwarmPowerSpawn();
            newMemory = new StructureMemory<SwarmType.SwarmPowerSpawn>(mem as TStructureData);
            break;*/
            case (SwarmType.SwarmRampart):
                newObj = new SwarmRampart();
                newMemory = new StructureMemory<SwarmType.SwarmRampart>(mem as TStructureData);
                break;
            case (SwarmType.SwarmRoad):
                newObj = new SwarmRoad();
                newMemory = new StructureMemory<SwarmType.SwarmRoad>(mem as TStructureData);
                break;
            case (SwarmType.SwarmRoom):
                newObj = new SwarmRoom();
                newMemory = new RoomMemory(mem as TRoomData);
                break;
            case (SwarmType.SwarmSite):
                newObj = new SwarmSite();
                newMemory = new RoomObjectMemory(mem as TRoomObjectData);
                break;
            case (SwarmType.SwarmSource):
                newObj = new SwarmSource();
                newMemory = new RoomObjectMemory(mem as ISourceData);
                break;
            case (SwarmType.SwarmSpawn):
                newObj = new SwarmSpawn();
                newMemory = new StructureMemory<SwarmType.SwarmSpawn>(mem as TStructureData);
                break;
            case (SwarmType.SwarmStorage):
                newObj = new SwarmStorage();
                newMemory = new StructureMemory<SwarmType.SwarmStorage>(mem as TStructureData);
                break;
            case (SwarmType.SwarmTerminal):
                newObj = new SwarmTerminal();
                newMemory = new StructureMemory<SwarmType.SwarmTerminal>(mem as TStructureData);
                break;
            case (SwarmType.SwarmTombstone):
                newObj = new SwarmTombstone();
                newMemory = new RoomObjectMemory(mem as TRoomObjectData);
                break;
            case (SwarmType.SwarmTower):
                newObj = new SwarmTower();
                newMemory = new StructureMemory<SwarmType.SwarmTower>(mem as TStructureData);
                break;
            case (SwarmType.SwarmWall):
                newObj = new SwarmWall();
                newMemory = new StructureMemory<SwarmType.SwarmWall>(mem as TStructureData);
                break;
        }

        newObj!.AssignObject(obj, newMemory!);
        return newObj!;
    }
    static CreateNewSwarmObject(obj: any, swarmType: SwarmType) {
        let newMemory: TSwarmMemory;
        let newObj: TObject;
        switch (swarmType) {
            case (SwarmType.SwarmContainer):
                newObj = new SwarmContainer();
                newMemory = new StructureMemory<SwarmType.SwarmContainer>({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmContainer
                });
                break;
            case (SwarmType.SwarmController):
                newObj = new SwarmController();
                newMemory = new StructureMemory<SwarmType.SwarmController>({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmController
                });
                break;
            case (SwarmType.SwarmCreep):
                newObj = new SwarmCreep();
                newMemory = new CreepMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Creep,
                    SWARM_TYPE: SwarmType.SwarmCreep,
                    CM_TYPE: CreepModule.Any
                });
                break;
            case (SwarmType.SwarmExtension):
                newObj = new SwarmExtension();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtension
                });
                break;
            case (SwarmType.SwarmExtractor):
                newObj = new SwarmExtractor();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtractor
                });
                break;
            case (SwarmType.SwarmFlag):
                newObj = new SwarmFlag();
                newMemory = new FlagMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Flag,
                    SWARM_TYPE: SwarmType.SwarmFlag,
                    FLG_TYPE: 0
                });
                break;
            case (SwarmType.SwarmKeepersLair):
                /*newObj = new SwarmExtractor();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtractor
                });*/
                throw new NotImplementedException("SwarmKeepersLair has not been set up yet.");
            case (SwarmType.SwarmLab):
                newObj = new SwarmLab();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmLab
                });
                break;
            case (SwarmType.SwarmLink):
                newObj = new SwarmLink();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmLink
                });
                break;
            case (SwarmType.SwarmMineral):
                newObj = new SwarmMineral();
                newMemory = new RoomObjectMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmMineral,
                    RO_TYPE: 0
                });
                break;
            case (SwarmType.SwarmNuke):
                newObj = new SwarmNuke();
                newMemory = new RoomObjectMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmNuke,
                    RO_TYPE: 0
                });
                break;
            case (SwarmType.SwarmNuker):
                newObj = new SwarmNuker();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmNuker
                });
                break;
            case (SwarmType.SwarmObserver):
                newObj = new SwarmObserver();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmObserver
                });
                break;
            case (SwarmType.SwarmPortal):
                /*newObj = new SwarmExtractor();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtractor
                });*/
                throw new NotImplementedException("SwarmPortal has not been set up yet.");
            case (SwarmType.SwarmPowerBank):
                /*newObj = new SwarmExtractor();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtractor
                });*/
                throw new NotImplementedException("SwarmPowerBank has not been set up yet.");
            case (SwarmType.SwarmPowerSpawn):
                /*newObj = new SwarmExtractor();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmExtractor
                });*/
                throw new NotImplementedException("SwarmPowerSpawn has not been set up yet.");
            case (SwarmType.SwarmRampart):
                newObj = new SwarmRampart();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmRampart
                });
                break;
            case (SwarmType.SwarmResource):
                newObj = new SwarmResource();
                newMemory = new RoomObjectMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmResource,
                    RO_TYPE: 0
                });
                break;
            case (SwarmType.SwarmRoad):
                newObj = new SwarmRoad();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmRoad
                });
                break;
            case (SwarmType.SwarmRoom):
                newObj = new SwarmRoom();
                newMemory = new RoomMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Room,
                    SWARM_TYPE: SwarmType.SwarmRoom,
                    RM_TYPE: 0,
                    OBJs: {
                        MEM_TYPE: SwarmDataType.Master,
                        ChildData: {},
                        id: 'roomObjects'
                    }
                });
                break;
            case (SwarmType.SwarmSite):
                newObj = new SwarmSite();
                newMemory = new RoomObjectMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmSite,
                    RO_TYPE: 0
                });
                break;
            case (SwarmType.SwarmSource):
                newObj = new SwarmSource();
                newMemory = new RoomObjectMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmSource,
                    RO_TYPE: 0
                });
                break;
            case (SwarmType.SwarmSpawn):
                newObj = new SwarmSpawn();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmSpawn
                });
                break;
            case (SwarmType.SwarmStorage):
                newObj = new SwarmStorage();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmStorage
                });
                break;
            case (SwarmType.SwarmTerminal):
                newObj = new SwarmTerminal();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmTerminal
                });
                break;
            case (SwarmType.SwarmTombstone):
                newObj = new SwarmTombstone();
                newMemory = new RoomObjectMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.RoomObject,
                    SWARM_TYPE: SwarmType.SwarmTombstone,
                    RO_TYPE: 0
                });
                break;
            case (SwarmType.SwarmTower):
                newObj = new SwarmTower();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmTower
                });
                break;
            case (SwarmType.SwarmWall):
                newObj = new SwarmWall();
                newMemory = new StructureMemory({
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmWall
                });
                break;
        }

        newObj!.AssignObject(obj, newMemory!);
        return newObj!;
    }
} global['SwarmCreator'] = SwarmCreator;