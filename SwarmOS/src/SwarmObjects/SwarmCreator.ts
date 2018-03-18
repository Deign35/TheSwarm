import { profile } from "Tools/Profiler";
import { MakeSwarmSite } from "SwarmObjects/SwarmSite";
import { MakeSwarmCreep } from "SwarmObjects/SwarmCreep";
import { MakeSwarmMineral, MakeSwarmNuke, MakeSwarmResource, MakeSwarmTombstone, SwarmObject } from "SwarmObjects/SwarmObject";
import { MakeSwarmRoom } from "SwarmObjects/SwarmRoom";
import { MakeSwarmSource } from "SwarmObjects/SwarmSource";
import { MakeSwarmFlag } from "SwarmObjects/SwarmFlag";
import { InvalidArgumentException } from "Tools/SwarmExceptions";
import { MakeSwarmContainer, MakeSwarmExtension, MakeSwarmExtractor, MakeSwarmLink, MakeSwarmNuker, MakeSwarmObserver, MakeSwarmRampart, MakeSwarmRoad, MakeSwarmWall, MakeSwarmTerminal, MakeSwarmStorage } from "SwarmObjects/SwarmStructures/SwarmStructure";
import { MakeSwarmController } from "SwarmObjects/SwarmStructures/SwarmController";
import { MakeSwarmLab } from "SwarmObjects/SwarmStructures/SwarmLab";
import { MakeSwarmSpawn } from "SwarmObjects/SwarmStructures/SwarmSpawn";
import { MakeSwarmTower } from "SwarmObjects/SwarmStructures/SwarmTower";


@profile
export class SwarmCreator {
    static CreateSwarmObject<T extends Source | Creep
        | Mineral | Resource | Room | Flag | AnyStructure
        | ConstructionSite | Nuke | Tombstone>(obj: T, type: SwarmType): ISwarmItem<any> {
        switch (type) {
            case (SwarmType.SwarmSite):
                return (MakeSwarmSite(obj as ConstructionSite));
            case (SwarmType.SwarmCreep):
                return (MakeSwarmCreep(obj as Creep));
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
    }
} global['SwarmCreator'] = SwarmCreator;