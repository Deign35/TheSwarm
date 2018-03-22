import { profile } from "Tools/Profiler";
import { SwarmContainer } from "./SwarmStructures/SwarmStructure";



var SwarmTypeToSwarmObj = {}
@profile
export class SwarmCreator {
    static CreateSwarmObject<T extends ISwarmMemory<ISwarmData<SwarmDataType, V>>, U extends Room | RoomObject | Creep | Flag | Structure<StructureConstant>, V extends SwarmType>
        (obj: U, swarmType: SwarmType): ISwarmObject<T, U> {
        switch (swarmType) {
            case (SwarmType.SwarmContainer):
                let theObj = obj as Structure<STRUCTURE_CONTAINER>
                let newDataObj: IStructureData<SwarmType.SwarmContainer> = {
                    id: obj['id'],
                    MEM_TYPE: SwarmDataType.Structure,
                    SWARM_TYPE: SwarmType.SwarmContainer
                }
                let newContainer = new SwarmContainer();
                newContainer.AssignObject(theObj, newDataObj);
                return newContainer;
        }
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