import { MakeSwarmTombstone, MakeSwarmMineral, MakeSwarmNuke, MakeSwarmResource, MakeSwarmSource } from "SwarmObjects/SwarmObject";
import { SwarmCreep, MakeSwarmCreep } from "SwarmObjects/SwarmCreep";
import "./SwarmStructures/SwarmStructure";
import { MakeSwarmSite } from "./SwarmSite";
import { InvalidArgumentException } from "Tools/SwarmExceptions";
import { SwarmStructure, MakeSwarmExtension, MakeSwarmExtractor, MakeSwarmLink, MakeSwarmNuker, MakeSwarmObserver, MakeSwarmRampart, MakeSwarmRoad, MakeSwarmStorage, MakeSwarmTerminal, MakeSwarmWall, MakeSwarmContainer } from "./SwarmStructures/SwarmStructure";
import { MakeSwarmController } from "SwarmObjects/SwarmStructures/SwarmController";
import { MakeSwarmLab } from "SwarmObjects/SwarmStructures/SwarmLab";
import { MakeSwarmSpawn } from "SwarmObjects/SwarmStructures/SwarmSpawn";
import { MakeSwarmTower } from "SwarmObjects/SwarmStructures/SwarmTower";
import { MakeSwarmRoom } from "SwarmObjects/SwarmRoom";
import { MakeSwarmFlag } from "SwarmObjects/SwarmFlag";
import { profile } from "Tools/Profiler";
import { RoomObjectMemory, CreepMemory, FlagMemory, RoomMemory, StructureMemory } from "Memory/StorageMemory";

@profile
export class SwarmCreator {
    static CreateSwarmObject<T extends Source | Creep
        | Mineral | Resource | Room | Flag
        | ConstructionSite | Nuke | Tombstone, U extends SwarmType>(obj: T, type: U, storageData: ISwarmMemory) {
        switch (type) {
            case (SwarmType.SwarmSite):
                return (MakeSwarmSite(obj as ConstructionSite, storageData as RoomObjectMemory));
            case (SwarmType.SwarmCreep):
                return (MakeSwarmCreep(obj as Creep, storageData as CreepMemory));
            case (SwarmType.SwarmMineral):
                return (MakeSwarmMineral(obj as Mineral, storageData as RoomObjectMemory));
            case (SwarmType.SwarmNuke):
                return (MakeSwarmNuke(obj as Nuke, storageData as RoomObjectMemory));
            case (SwarmType.SwarmResource):
                return (MakeSwarmResource(obj as Resource, storageData as RoomObjectMemory));
            case (SwarmType.SwarmRoom):
                return MakeSwarmRoom(obj as Room, storageData as RoomMemory);
            case (SwarmType.SwarmSource):
                return (MakeSwarmSource(obj as Source, storageData as RoomObjectMemory));
            case (SwarmType.SwarmTombstone):
                return (MakeSwarmTombstone(obj as Tombstone, storageData as RoomObjectMemory));
            case (SwarmType.SwarmFlag):
                return (MakeSwarmFlag(obj as Flag, storageData as FlagMemory));
        }

        throw new InvalidArgumentException('Attempted to create an object that doesnt exist.  probably a structure.  ' + type);
    }

    static CreateSwarmStructure<U extends StructureConstant,
        T extends SwarmStructure<U, Structure<U>, V>, V extends SwarmType>(obj: Structure, type: V, memory: StructureMemory) {
        switch (type) {
            case (SwarmType.SwarmContainer):
                return MakeSwarmContainer(obj as StructureContainer, memory);
            case (SwarmType.SwarmController):
                return MakeSwarmController(obj as StructureController, memory);
            case (SwarmType.SwarmExtension):
                return MakeSwarmExtension(obj as StructureExtension, memory);
            case (SwarmType.SwarmExtractor):
                return MakeSwarmExtractor(obj as StructureExtractor, memory);
            case (SwarmType.SwarmLab):
                return MakeSwarmLab(obj as StructureLab, memory);
            case (SwarmType.SwarmLink):
                return MakeSwarmLink(obj as StructureLink, memory);
            case (SwarmType.SwarmNuker):
                return MakeSwarmNuker(obj as StructureNuker, memory);
            case (SwarmType.SwarmObserver):
                return MakeSwarmObserver(obj as StructureObserver, memory);
            case (SwarmType.SwarmRampart):
                return MakeSwarmRampart(obj as StructureRampart, memory);
            case (SwarmType.SwarmRoad):
                return MakeSwarmRoad(obj as StructureRoad, memory);
            case (SwarmType.SwarmSpawn):
                return MakeSwarmSpawn(obj as StructureSpawn, memory);
            case (SwarmType.SwarmStorage):
                return MakeSwarmStorage(obj as StructureStorage, memory);
            case (SwarmType.SwarmTerminal):
                return MakeSwarmTerminal(obj as StructureTerminal, memory);
            case (SwarmType.SwarmTower):
                return MakeSwarmTower(obj as StructureTower, memory);
            case (SwarmType.SwarmWall):
                return MakeSwarmWall(obj as StructureWall, memory);
        }
        throw new InvalidArgumentException('Attempted to create a structure that doesnt exist.  probably another type.  ' + type);
    }
}