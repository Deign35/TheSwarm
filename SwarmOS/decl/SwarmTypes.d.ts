declare interface IObject<T extends SwarmMemoryTypes, U> extends _Constructor<U> {
    saveID: string;
    IsActive: boolean;

    Activate(): void;
    AssignObject(obj: U, objMemory: T): void;

    GetMemType(): number;
    ReleaseMemory(): T
    GetObjectInstance(): U
}
declare interface IOtherObject extends IObject<IOtherMemory, any> {

}
declare interface ISwarmObject<T extends SwarmMemoryTypes, U extends Room | RoomObject | Creep | Flag | AnyStructure>
    extends IObject<T, U> {
    GetMemType(): SwarmDataType;
}

declare interface ISwarmRoom extends ISwarmObject<IRoomMemory, Room> {
    my: boolean;
    owner?: Owner;
}
declare interface ISwarmCreep extends ISwarmObject<ICreepMemory, Creep> { }
declare interface ISwarmFlag extends ISwarmObject<IFlagMemory, Flag> { }

/** 
 *  Structures begin here.
*/
declare interface ISwarmStructureType<T extends StructureConstant> extends ISwarmObject<TStructureMemory, Structure<T>> {

}

declare interface ISwarmContainer extends ISwarmStructureType<STRUCTURE_CONTAINER> {

}
declare interface ISwarmController extends ISwarmStructureType<STRUCTURE_CONTROLLER> {

}
declare interface ISwarmExtension extends ISwarmStructureType<STRUCTURE_EXTENSION> {

}
declare interface ISwarmExtractor extends ISwarmStructureType<STRUCTURE_EXTRACTOR> {

}
declare interface ISwarmKeepersLair extends ISwarmStructureType<STRUCTURE_KEEPER_LAIR> {

}
declare interface ISwarmLab extends ISwarmStructureType<STRUCTURE_LAB> {

}
declare interface ISwarmLink extends ISwarmStructureType<STRUCTURE_LINK> {

}
declare interface ISwarmNuker extends ISwarmStructureType<STRUCTURE_NUKER> {

}
declare interface ISwarmObserver extends ISwarmStructureType<STRUCTURE_OBSERVER> {

}
declare interface ISwarmPowerBank extends ISwarmStructureType<STRUCTURE_POWER_BANK> {

}
declare interface ISwarmPowerSpawn extends ISwarmStructureType<STRUCTURE_POWER_SPAWN> {

}
declare interface ISwarmPortal extends ISwarmStructureType<STRUCTURE_PORTAL> {

}
declare interface ISwarmRampart extends ISwarmStructureType<STRUCTURE_RAMPART> {

}
declare interface ISwarmRoad extends ISwarmStructureType<STRUCTURE_ROAD> {

}
declare interface ISwarmSpawn extends ISwarmStructureType<STRUCTURE_SPAWN> {

}
declare interface ISwarmStorage extends ISwarmStructureType<STRUCTURE_STORAGE> {

}
declare interface ISwarmTerminal extends ISwarmStructureType<STRUCTURE_TERMINAL> {

}
declare interface ISwarmTower extends ISwarmStructureType<STRUCTURE_TOWER> {

}
declare interface ISwarmWall extends ISwarmStructureType<STRUCTURE_WALL> {

}
declare type TSwarmStructure = ISwarmContainer | ISwarmController | ISwarmExtension | ISwarmExtractor | ISwarmKeepersLair |
    ISwarmLab | ISwarmLink | ISwarmNuker | ISwarmObserver | ISwarmPortal | ISwarmPowerBank | ISwarmPowerSpawn |
    ISwarmRampart | ISwarmRoad | ISwarmSpawn | ISwarmStorage | ISwarmTerminal | ISwarmTower | ISwarmWall;

declare type TOwnableSwarmStructure = ISwarmController | ISwarmExtension | ISwarmExtractor | ISwarmKeepersLair |
    ISwarmLab | ISwarmLink | ISwarmNuker | ISwarmObserver | ISwarmPowerBank | ISwarmPowerSpawn |
    ISwarmRampart | ISwarmSpawn | ISwarmStorage | ISwarmTerminal | ISwarmTower

declare interface ISwarmRoomObject<T extends SwarmMemoryTypes, U extends RoomObjectType> extends ISwarmObject<T, U> {

}
declare type RoomObjectType = Mineral | Source | Nuke | Resource | ConstructionSite | Tombstone;
declare interface ISwarmMineral extends ISwarmRoomObject<IMineralMemory, Mineral> {

}
declare interface ISwarmSource extends ISwarmRoomObject<ISourceMemory, Source> {

}
declare interface ISwarmNuke extends ISwarmRoomObject<INukeMemory, Nuke> {

}
declare interface ISwarmResource extends ISwarmRoomObject<IResourceMemory, Resource> {

}
declare interface ISwarmSite extends ISwarmRoomObject<ISiteMemory, ConstructionSite> {

}
declare interface ISwarmTombstone extends ISwarmRoomObject<ITombstoneMemory, Tombstone> {

} declare type TSwarmRoomObject = ISwarmTombstone | ISwarmResource | ISwarmNuke | ISwarmSource | ISwarmMineral | ISwarmSite
declare type TSwarmObject = IOtherObject | ISwarmRoom | TSwarmRoomObject | ISwarmCreep | ISwarmFlag | ISwarmRoom | TSwarmStructure

declare interface ISwarmObjectController<T extends SwarmControllerDataTypes, U extends TSwarmObject> {
    ControllerType: T,
    GetSwarmObject(id: string): U;
}


declare interface ISwarmRoomController extends ISwarmObjectController<SwarmControllerDataTypes.Rooms, ISwarmRoom> {
}
declare interface ISwarmCreepController extends ISwarmObjectController<SwarmControllerDataTypes.Creeps, ISwarmCreep> {
}
declare interface ISwarmStructureController extends ISwarmObjectController<SwarmControllerDataTypes.Structures, TSwarmStructure> {
}
declare interface ISwarmFlagController extends ISwarmObjectController<SwarmControllerDataTypes.Flags, ISwarmFlag> {
}
declare interface ISwarmRoomObjectController extends ISwarmObjectController<SwarmControllerDataTypes.RoomObjects, TSwarmRoomObject> {
}
declare interface IOtherObjectController extends ISwarmObjectController<SwarmControllerDataTypes.Other, IOtherObject> {

}

declare var SwarmCreator: {
    CreateSwarmMemory(mem: IData<SwarmDataType>): SwarmMemoryTypes;
    CreateSwarmObject(swarmType: SwarmType): TSwarmObject;
    CreateNewSwarmMemory(id: string, swarmType: SwarmType): SwarmMemoryTypes;
    GetStructureSwarmType(structure: Structure): SwarmStructureType;
    GetSwarmType(obj: any): SwarmType;
    CreateNewSwarmObject<T extends TSwarmObject>(obj: Room | RoomObject): T;
    GetObjSaveID(obj: Room | RoomObject): string;
}

declare type RoomObjectDataStructure = {
    minerals: IMineralData[],
    nukes: IRoomObjectData<SwarmType.SwarmNuke>[],
    resources: IRoomObjectData<SwarmType.SwarmResource>[],
    sources: ISourceData[],
    tombstones: IRoomObjectData<SwarmType.SwarmTombstone>[],
}