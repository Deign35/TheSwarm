import { profile } from "Tools/Profiler";
import { MakeSwarmSite } from "SwarmObjects/SwarmSite";
import { MakeSwarmCreep } from "SwarmObjects/SwarmCreep";
import { MakeSwarmMineral, MakeSwarmNuke, MakeSwarmResource, MakeSwarmTombstone } from "SwarmObjects/SwarmObject";
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
        | Mineral | Resource | Room | Flag
        | ConstructionSite | Nuke | Tombstone>(obj: T, type: SwarmType, parentPath: string[]) {
        switch (type) {
            case (SwarmType.SwarmSite):
                return (MakeSwarmSite(obj as ConstructionSite, parentPath));
            case (SwarmType.SwarmCreep):
                return (MakeSwarmCreep(obj as Creep, parentPath));
            case (SwarmType.SwarmMineral):
                return (MakeSwarmMineral(obj as Mineral, parentPath));
            case (SwarmType.SwarmNuke):
                return (MakeSwarmNuke(obj as Nuke, parentPath));
            case (SwarmType.SwarmResource):
                return (MakeSwarmResource(obj as Resource, parentPath));
            case (SwarmType.SwarmRoom):
                return MakeSwarmRoom(obj as Room, parentPath);
            case (SwarmType.SwarmSource):
                return (MakeSwarmSource(obj as Source, parentPath));
            case (SwarmType.SwarmTombstone):
                return (MakeSwarmTombstone(obj as Tombstone, parentPath));
            case (SwarmType.SwarmFlag):
                return (MakeSwarmFlag(obj as Flag, parentPath));
        }

        throw new InvalidArgumentException('Attempted to create an object that doesnt exist.  probably a structure.  ' + type);
    }

    static CreateSwarmStructure(obj: Structure, type: SwarmType, parentPath: string[]): TSwarmStructure {
        switch (type) {
            case (SwarmType.SwarmContainer):
                return MakeSwarmContainer(obj as StructureContainer, parentPath);
            case (SwarmType.SwarmController):
                return MakeSwarmController(obj as StructureController, parentPath);
            case (SwarmType.SwarmExtension):
                return MakeSwarmExtension(obj as StructureExtension, parentPath);
            case (SwarmType.SwarmExtractor):
                return MakeSwarmExtractor(obj as StructureExtractor, parentPath);
            case (SwarmType.SwarmLab):
                return MakeSwarmLab(obj as StructureLab, parentPath);
            case (SwarmType.SwarmLink):
                return MakeSwarmLink(obj as StructureLink, parentPath);
            case (SwarmType.SwarmNuker):
                return MakeSwarmNuker(obj as StructureNuker, parentPath);
            case (SwarmType.SwarmObserver):
                return MakeSwarmObserver(obj as StructureObserver, parentPath);
            case (SwarmType.SwarmRampart):
                return MakeSwarmRampart(obj as StructureRampart, parentPath);
            case (SwarmType.SwarmRoad):
                return MakeSwarmRoad(obj as StructureRoad, parentPath);
            case (SwarmType.SwarmSpawn):
                return MakeSwarmSpawn(obj as StructureSpawn, parentPath);
            case (SwarmType.SwarmStorage):
                return MakeSwarmStorage(obj as StructureStorage, parentPath);
            case (SwarmType.SwarmTerminal):
                return MakeSwarmTerminal(obj as StructureTerminal, parentPath);
            case (SwarmType.SwarmTower):
                return MakeSwarmTower(obj as StructureTower, parentPath);
            case (SwarmType.SwarmWall):
                return MakeSwarmWall(obj as StructureWall, parentPath);
        }
        throw new InvalidArgumentException('Attempted to create a structure that doesnt exist.  probably another type.  ' + type);
    }
} global['SwarmCreator'] = SwarmCreator;