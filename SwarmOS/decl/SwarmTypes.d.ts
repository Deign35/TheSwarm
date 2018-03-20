declare interface ISpawnRequirement {
    [id: string]: any;
    priority: Priority;
    minBody: BodyPartConstant[];
    growthTemplate: BodyPartConstant[];
    neededIn: number;
}
declare interface ISwarmType<T extends SwarmType, U extends SwarmDataType,
    V extends Room | RoomObject> extends _Constructor<V> {
    SwarmType: T
    saveID: string;
    IsActive: boolean;
    Activate(): void;
    GetMemoryObject(): ISwarmMemory<T, U>
    AssignMemory(mem: ISwarmMemory<T, U>): void;
    InitNewObject(): void;
    GetSpawnRequirements(): ISpawnRequirement;
}

declare interface ISwarmRoomObjectBase<T extends SwarmType,
    U extends SwarmDataType, V extends RoomObject> extends ISwarmType<T, U, V> {

}
declare interface ISwarmRoom extends ISwarmType<SwarmType.SwarmRoom, SwarmDataType.Room, Room> { }
declare interface ISwarmCreep extends ISwarmRoomObjectBase<SwarmType.SwarmCreep, SwarmDataType.Creep, Creep> { }
declare interface ISwarmFlag extends ISwarmRoomObjectBase<SwarmType.SwarmFlag, SwarmDataType.Flag, Flag> { }

/** 
 *  Structures begin here.
*/
declare interface ISwarmStructureType<T extends SwarmStructureType, V extends StructureConstant>
    extends ISwarmRoomObjectBase<T, SwarmDataType.Structure, Structure<V>> {

}

declare interface ISwarmContainer extends ISwarmStructureType<SwarmType.SwarmContainer, STRUCTURE_CONTAINER> {

}
declare interface ISwarmController extends ISwarmStructureType<SwarmType.SwarmController, STRUCTURE_CONTROLLER> {

}
declare interface ISwarmExtension extends ISwarmStructureType<SwarmType.SwarmExtension, STRUCTURE_EXTENSION> {

}
declare interface ISwarmExtractor extends ISwarmStructureType<SwarmType.SwarmExtractor, STRUCTURE_EXTRACTOR> {

}
declare interface ISwarmKeepersLair extends ISwarmStructureType<SwarmType.SwarmKeepersLair, STRUCTURE_KEEPER_LAIR> {

}
declare interface ISwarmLab extends ISwarmStructureType<SwarmType.SwarmLab, STRUCTURE_LAB> {

}
declare interface ISwarmLink extends ISwarmStructureType<SwarmType.SwarmLink, STRUCTURE_LINK> {

}
declare interface ISwarmNuker extends ISwarmStructureType<SwarmType.SwarmNuker, STRUCTURE_NUKER> {

}
declare interface ISwarmObserver extends ISwarmStructureType<SwarmType.SwarmObserver, STRUCTURE_OBSERVER> {

}
declare interface ISwarmPowerBank extends ISwarmStructureType<SwarmType.SwarmPowerBank, STRUCTURE_POWER_BANK> {

}
declare interface ISwarmPowerSpawn extends ISwarmStructureType<SwarmType.SwarmPowerSpawn, STRUCTURE_POWER_SPAWN> {

}
declare interface ISwarmPortal extends ISwarmStructureType<SwarmType.SwarmPortal, STRUCTURE_PORTAL> {

}
declare interface ISwarmRampart extends ISwarmStructureType<SwarmType.SwarmRampart, STRUCTURE_RAMPART> {

}
declare interface ISwarmRoad extends ISwarmStructureType<SwarmType.SwarmRoad, STRUCTURE_ROAD> {

}
declare interface ISwarmSpawn extends ISwarmStructureType<SwarmType.SwarmSpawn, STRUCTURE_SPAWN> {

}
declare interface ISwarmStorage extends ISwarmStructureType<SwarmType.SwarmStorage, STRUCTURE_STORAGE> {

}
declare interface ISwarmTerminal extends ISwarmStructureType<SwarmType.SwarmTerminal, STRUCTURE_TERMINAL> {

}
declare interface ISwarmTower extends ISwarmStructureType<SwarmType.SwarmTower, STRUCTURE_TOWER> {

}
declare interface ISwarmWall extends ISwarmStructureType<SwarmType.SwarmWall, STRUCTURE_WALL> {

}
declare type ISwarmStructure = ISwarmContainer | ISwarmController | ISwarmExtension | ISwarmExtractor | ISwarmKeepersLair |
    ISwarmLab | ISwarmLink | ISwarmNuker | ISwarmObserver | ISwarmPortal | ISwarmPowerBank | ISwarmPowerSpawn |
    ISwarmRampart | ISwarmRoad | ISwarmSpawn | ISwarmStorage | ISwarmTerminal | ISwarmTower | ISwarmWall;

declare type IOwnableSwarmStructure = ISwarmController | ISwarmExtension | ISwarmExtractor | ISwarmKeepersLair |
    ISwarmLab | ISwarmLink | ISwarmNuker | ISwarmObserver | ISwarmPowerBank | ISwarmPowerSpawn |
    ISwarmRampart | ISwarmSpawn | ISwarmStorage | ISwarmTerminal | ISwarmTower

declare interface ISwarmRoomObject<T extends SwarmType> extends ISwarmRoomObjectBase<T, SwarmDataType.RoomObject, RoomObject> {

}
declare interface ISwarmMineral extends ISwarmRoomObject<SwarmType.SwarmMineral> {

}
declare interface ISwarmSource extends ISwarmRoomObject<SwarmType.SwarmSource> {

}
declare interface ISwarmNuke extends ISwarmRoomObject<SwarmType.SwarmNuke> {

}
declare interface ISwarmResource extends ISwarmRoomObject<SwarmType.SwarmResource> {

}
declare interface ISwarmSite extends ISwarmRoomObject<SwarmType.SwarmSite> {

}
declare interface ISwarmTombstone extends ISwarmRoomObject<SwarmType.SwarmTombstone> {

}
declare type SwarmRoomObject = ISwarmRoomObject<SwarmRoomObjectType>;
declare type AllSwarmTypes = ISwarmRoom | SwarmRoomObject | ISwarmCreep | ISwarmFlag | ISwarmRoom | ISwarmStructure

declare interface ISwarmObjectController<T extends SwarmControllerDataTypes, U extends SwarmType> {
    DataType: T,
    GetSwarmObject<V extends SwarmDataType, X extends Room | RoomObject>(id: string): ISwarmType<U, V, X>;
    ActivateSwarm(): void;
    FinalizeSwarmActivity(): void;
    PrepareTheSwarm(): void;
}


declare interface ISwarmRoomController extends ISwarmObjectController<SwarmControllerDataTypes.Rooms, SwarmType.SwarmRoom> {
} declare var SwarmQueen: ISwarmRoomController;
declare interface ISwarmCreepController extends ISwarmObjectController<SwarmControllerDataTypes.Creeps, SwarmType.SwarmCreep> {
} declare var SwarmCreepController: ISwarmCreepController;
declare interface ISwarmStructureController extends ISwarmObjectController<SwarmControllerDataTypes.Structures, SwarmStructureType> {
} declare var SwarmStructureController: ISwarmStructureController;
declare interface ISwarmFlagController extends ISwarmObjectController<SwarmControllerDataTypes.Flags, SwarmType.SwarmFlag> {
} declare var SwarmFlagController: ISwarmFlagController;

declare interface ISwarmRoomObjectController extends ISwarmObjectController<SwarmControllerDataTypes.RoomObjects, SwarmRoomObjectType> {

}