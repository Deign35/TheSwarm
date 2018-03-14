import { SwarmItem, MakeSwarmTombstone, MakeSwarmMineral, MakeSwarmNuke, MakeSwarmResource, MakeSwarmSource } from "SwarmObjects/SwarmObject";
import { SwarmCreep, MakeSwarmCreep } from "SwarmObjects/SwarmCreep";
import "./SwarmStructure";
import { MakeSwarmSite } from "./SwarmSite";
import { InvalidArgumentException } from "Tools/SwarmExceptions";
import { SwarmStructure, MakeSwarmExtension, MakeSwarmExtractor, MakeSwarmLink, MakeSwarmNuker, MakeSwarmObserver, MakeSwarmRampart, MakeSwarmRoad, MakeSwarmStorage, MakeSwarmTerminal, MakeSwarmWall, MakeSwarmContainer } from "./SwarmStructure";
import { MakeSwarmController } from "SwarmObjects/SwarmController";
import { MakeSwarmLab } from "SwarmObjects/SwarmLab";
import { MakeSwarmSpawn } from "SwarmObjects/SwarmSpawn";
import { MakeSwarmTower } from "SwarmObjects/SwarmTower";

export class SwarmCreator {
    CreateSwarmObject<T extends Source | Creep
        | Mineral | Resource
        | ConstructionSite | Nuke | Tombstone, U extends SwarmType>(obj: T, type: U) {
        switch (type) {
            case (SwarmType.SwarmSite):
                return (MakeSwarmSite(obj as ConstructionSite));
            case (SwarmType.SwarmSite):
                return (MakeSwarmCreep(obj as Creep));
            case (SwarmType.SwarmSite):
                return (MakeSwarmMineral(obj as Mineral));
            case (SwarmType.SwarmSite):
                return (MakeSwarmNuke(obj as Nuke));
            case (SwarmType.SwarmSite):
                return (MakeSwarmResource(obj as Resource));
            case (SwarmType.SwarmSource):
                return (MakeSwarmSource(obj as Source));
            case (SwarmType.SwarmSite):
                return (MakeSwarmTombstone(obj as Tombstone));
        }

        throw new InvalidArgumentException('Attempted to create an object that doesnt exist.  probably a structure.  ' + type);
    }

    CreateSwarmStructure<U extends StructureConstant, T extends SwarmStructure<U, Structure<U>, V>, V extends SwarmType>(obj: Structure, type: V) {
        switch (type) {
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
        throw new InvalidArgumentException('Attempted to create a structure that doesnt exist.  probably another type.  ' + type);
    }
}