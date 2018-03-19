declare interface ISpawnRequirement {
    [id: string]: any;
    priority: Priority;
    minBody: BodyPartConstant[];
    growthTemplate: BodyPartConstant[];
    neededIn: number;
}
declare interface ISwarmType<T extends SwarmType, U extends SwarmDataType, V extends Room | RoomObject> extends _Constructor<V> {
    SwarmType: T
    Value: V;
    DataType: U;
    saveID: string;
    IsActive: boolean;
    GetMemoryObject(): IEmptyMemory<U>
    Activate(): void;
    AssignMemory(mem: IEmptyMemory<U>): void;
    InitNewObject(): void;
    GetSpawnRequirements(): ISpawnRequirement;
}


declare interface ISwarmRoom extends ISwarmType<SwarmType.SwarmRoom, SwarmDataType.Room, Room> { }
declare interface ISwarmCreep extends ISwarmType<SwarmType.SwarmCreep, SwarmDataType.Creep, Creep> { }
declare interface ISwarmFlag extends ISwarmType<SwarmType.SwarmFlag, SwarmDataType.Flag, Flag> { }

/** 
 *  Structures begin here.
*/
declare interface ISwarmStructureType<T extends SwarmStructureType, U extends StructureConstant>
    extends ISwarmType<T, SwarmDataType.Structure, Structure<U>> {

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

declare interface ISwarmRoomObject<T extends SwarmType> extends ISwarmType<T, SwarmDataType.RoomObject, RoomObject> {

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
declare type SwarmRoomObject = ISwarmStructure | ISwarmCreep | ISwarmFlag | ISwarmMineral | ISwarmNuke |
    ISwarmResource | ISwarmSite | ISwarmTombstone;
declare type AllSwarmTypes = ISwarmRoom | SwarmRoomObject

declare interface IMasterSwarmController<T extends SwarmType, U extends AllSwarmTypes> {
    StorageType: T;
    ActivateSwarm(): void;
    GetSwarmObject(id: string): U;
    FinalizeSwarmActivity(): void;
    PrepareTheSwarm(): void;
}


declare interface ISwarmRoomController extends IMasterSwarmController<SwarmType.SwarmRoom, ISwarmRoom> {
} declare var SwarmQueen: ISwarmRoomController;
declare interface ISwarmCreepController extends IMasterSwarmController<SwarmType.SwarmCreep, ISwarmCreep> {
} declare var SwarmCreepController: ISwarmCreepController;
declare interface ISwarmStructureController extends IMasterSwarmController<SwarmStructureType, ISwarmStructure> {
} declare var SwarmStructureController: ISwarmStructureController;
declare interface ISwarmFlagController extends IMasterSwarmController<SwarmType.SwarmFlag, ISwarmFlag> {
} declare var SwarmFlagController: ISwarmFlagController;

declare interface ISwarmRoomObjectController<T extends SwarmRoomObjectType>
    extends IMasterSwarmController<T, SwarmRoomObject> {

}