import { profile } from "Tools/Profiler";
import { MakeSwarmSite, SwarmSite } from "SwarmTypes/SwarmSite";
import { MakeSwarmCreep } from "SwarmTypes/SwarmCreep";
import { MakeSwarmFlag } from "SwarmTypes/SwarmFlag";
import { MakeSwarmMineral, MakeSwarmNuke, MakeSwarmResource } from "./SwarmTypes";
import { MakeSwarmRoom } from "./SwarmRoom";
import { MakeSwarmSource } from "./SwarmSource";
import { MakeSwarmContainer, MakeSwarmExtension, MakeSwarmExtractor, MakeSwarmLink, MakeSwarmNuker, MakeSwarmObserver, MakeSwarmRampart, MakeSwarmRoad, MakeSwarmStorage, MakeSwarmTerminal, MakeSwarmWall } from "./SwarmStructures/SwarmStructure";
import { MakeSwarmController } from "SwarmTypes/SwarmStructures/SwarmController";
import { MakeSwarmLab } from "SwarmTypes/SwarmStructures/SwarmLab";
import { MakeSwarmSpawn } from "SwarmTypes/SwarmStructures/SwarmSpawn";
import { MakeSwarmTower } from "SwarmTypes/SwarmStructures/SwarmTower";

var ObjTypeToSwarmType = {};
ObjTypeToSwarmType[typeof ConstructionSite] = MakeSwarmSite;
ObjTypeToSwarmType[typeof Creep] = MakeSwarmCreep;
ObjTypeToSwarmType[typeof Flag] = MakeSwarmFlag;
ObjTypeToSwarmType[typeof Mineral] = MakeSwarmMineral;
ObjTypeToSwarmType[typeof Nuke] = MakeSwarmNuke;
ObjTypeToSwarmType[typeof Resource] = MakeSwarmResource;
ObjTypeToSwarmType[typeof Source] = MakeSwarmSource;
ObjTypeToSwarmType[typeof StructureContainer] = MakeSwarmContainer;
ObjTypeToSwarmType[typeof StructureExtension] = MakeSwarmExtension;
ObjTypeToSwarmType[typeof StructureExtractor] = MakeSwarmExtractor;
//ObjTypeToSwarmType[typeof StructureKeeperLair] =;
ObjTypeToSwarmType[typeof StructureLab] = MakeSwarmLab;
ObjTypeToSwarmType[typeof StructureLink] = MakeSwarmLink;
ObjTypeToSwarmType[typeof StructureNuker] = MakeSwarmNuker;
ObjTypeToSwarmType[typeof StructureObserver] = MakeSwarmObserver;
//ObjTypeToSwarmType[typeof StructurePowerBank] = MakeSwarmPowerBank;
//ObjTypeToSwarmType[typeof StructurePowerSpawn] = MakeSwarmPowerSpawn;
//ObjTypeToSwarmType[typeof StructurePortal] = MakeSwarmPortal;
ObjTypeToSwarmType[typeof StructureRampart] = MakeSwarmRampart;
ObjTypeToSwarmType[typeof StructureRoad] = MakeSwarmRoad;
ObjTypeToSwarmType[typeof StructureSpawn] = MakeSwarmSpawn;
ObjTypeToSwarmType[typeof StructureStorage] = MakeSwarmStorage;
ObjTypeToSwarmType[typeof StructureTerminal] = MakeSwarmTerminal;
ObjTypeToSwarmType[typeof StructureTower] = MakeSwarmTower;
ObjTypeToSwarmType[typeof StructureWall] = MakeSwarmWall;

var SwarmTypeToSwarmObj = {}
@profile
export class SwarmCreator {
    static CreateSwarmObject<T extends SwarmType>(obj: any): ISwarmObj<T, any, any> {
        return ObjTypeToSwarmType[typeof obj](obj);
    }
    /*tatic CreateSwarmObject<T extends Source | Creep
        | Mineral | Resource | Room | Flag
        | ConstructionSite<any> | Nuke | Tombstone>(obj: T, type: SwarmType): ISwarmObj<SwarmType, T, SwarmDataType> {/
    switch(type) {
            case(SwarmType.SwarmSite):
        return (MakeSwarmSite(obj as ConstructionSite));
            case (SwarmType.SwarmCreep):
return (MakeSwarmCreep(obj as Creep) as ISwarmCreep);
            case (SwarmType.SwarmMineral):
return (MakeSwarmMineral(obj as Mineral));
            case (SwarmType.SwarmNuke):
return (MakeSwarmNuke(obj as Nuke));
            case (SwarmType.SwarmResource):
return (MakeSwarmResource(obj as Resource));
            case (SwarmType.SwarmRoom):
return MakeSwarmRoom(obj as Room);
            case (SwarmType.SwarmSource):
return (MakeSwarmSource(obj as Source));
            case (SwarmType.SwarmTombstone):
return (MakeSwarmTombstone(obj as Tombstone));
            case (SwarmType.SwarmFlag):
return (MakeSwarmFlag(obj as Flag));
            case (SwarmType.SwarmContainer):
return MakeSwarmContainer(obj as StructureContainer);
            case (SwarmType.SwarmController):
return MakeSwarmController(obj as StructureController);
            case (SwarmType.SwarmExtension):
return MakeSwarmExtension(obj as StructureExtension);
            case (SwarmType.SwarmExtractor):
return MakeSwarmExtractor(obj as StructureExtractor);
            case (SwarmType.SwarmLab):
return MakeSwarmLab(obj as StructureLab);
            case (SwarmType.SwarmLink):
return MakeSwarmLink(obj as StructureLink);
            case (SwarmType.SwarmNuker):
return MakeSwarmNuker(obj as StructureNuker);
            case (SwarmType.SwarmObserver):
return MakeSwarmObserver(obj as StructureObserver);
            case (SwarmType.SwarmRampart):
return MakeSwarmRampart(obj as StructureRampart);
            case (SwarmType.SwarmRoad):
return MakeSwarmRoad(obj as StructureRoad);
            case (SwarmType.SwarmSpawn):
return MakeSwarmSpawn(obj as StructureSpawn);
            case (SwarmType.SwarmStorage):
return MakeSwarmStorage(obj as StructureStorage);
            case (SwarmType.SwarmTerminal):
return MakeSwarmTerminal(obj as StructureTerminal);
            case (SwarmType.SwarmTower):
return MakeSwarmTower(obj as StructureTower);
            case (SwarmType.SwarmWall):
return MakeSwarmWall(obj as StructureWall);
        }

throw new InvalidArgumentException('Attempted to create an object that doesnt exist.  probably a structure.  ' + type);
    }*/
} global['SwarmCreator'] = SwarmCreator;