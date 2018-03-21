declare interface ISpawnRequirement {
    [id: string]: any;
    priority: Priority;
    minBody: BodyPartConstant[];
    growthTemplate: BodyPartConstant[];
    neededIn: number;
}
declare interface IObject<T extends TMemory, U> extends _Constructor<U> {
    //ObjType: T;
    saveID: string;
    IsActive: boolean;

    GetMemType(): number;
    Activate(): void;
    AssignObject(obj: T): void;
    GetCopyOfMemory(): T
    GetCopyOfObject(): U
} declare type TObject = IObject<any, any>;
declare type LObject<T extends SwarmMemoryTypes> = IObject<T, any>
declare interface ISwarmObject<T extends SwarmMemoryTypes, U extends Room | RoomObject> extends IObject<T, U> {
    GetMemType(): SwarmType;
    GetSpawnRequirements(): ISpawnRequirement;
} declare type SwarmObject = ISwarmObject<SwarmMemoryTypes, Room | RoomObject>;

declare interface ISwarmRoomObjectBase<T extends IRoomObjectMemory | ICreepMemory | IFlagMemory | IStructureMemory,
    U extends RoomObject> extends ISwarmObject<T, U> {

} declare type TSwarmRoomObject = ISwarmRoomObjectBase<IRoomObjectMemory, RoomObject>;
declare interface ISwarmRoom extends ISwarmObject<IRoomMemory, Room> { }
declare interface ISwarmCreep extends ISwarmRoomObjectBase<ICreepMemory, Creep> { }
declare interface ISwarmFlag extends ISwarmRoomObjectBase<IFlagMemory, Flag> { }

/** 
 *  Structures begin here.
*/
declare interface ISwarmStructureType<T extends SwarmStructureType, V extends StructureConstant>
    extends ISwarmRoomObjectBase<IStructureMemory, Structure<V>> {

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

declare interface ISwarmRoomObject<T extends IRoomObjectMemory> extends ISwarmRoomObjectBase<T, RoomObject> {

}
declare interface ISwarmMineral extends ISwarmRoomObject<IRoomObjectMemory> {

}
declare interface ISwarmSource extends ISwarmRoomObject<IRoomObjectMemory> {

}
declare interface ISwarmNuke extends ISwarmRoomObject<IRoomObjectMemory> {

}
declare interface ISwarmResource extends ISwarmRoomObject<IRoomObjectMemory> {

}
declare interface ISwarmSite extends ISwarmRoomObject<IRoomObjectMemory> {

}
declare interface ISwarmTombstone extends ISwarmRoomObject<IRoomObjectMemory> {

}
declare type AllSwarmTypes = ISwarmRoom | TSwarmRoomObject | ISwarmCreep | ISwarmFlag | ISwarmRoom | ISwarmStructure

declare interface IMasterObject<T extends TObject> {
    GetChildMemory(id: string): T;
}
declare interface ISwarmObjectController<T extends SwarmControllerDataTypes, U extends SwarmObject>
    extends IMasterObject<AllSwarmTypes> {
    ControllerType: T,
    GetSwarmObject(id: string): U;
    GetSwarmTypeFromObject(obj: any): SwarmType; // These any need a fixin

    ActivateSwarm(): void;
    FinalizeSwarmActivity(): void;
    PrepareTheSwarm(): void;
}


declare interface ISwarmRoomController extends ISwarmObjectController<SwarmControllerDataTypes.Rooms, ISwarmRoom> {
} declare var SwarmQueen: ISwarmRoomController;
declare interface ISwarmCreepController extends ISwarmObjectController<SwarmControllerDataTypes.Creeps, ISwarmCreep> {
} declare var SwarmCreepController: ISwarmCreepController;
declare interface ISwarmStructureController extends ISwarmObjectController<SwarmControllerDataTypes.Structures, ISwarmStructure> {
} declare var SwarmStructureController: ISwarmStructureController;
declare interface ISwarmFlagController extends ISwarmObjectController<SwarmControllerDataTypes.Flags, ISwarmFlag> {
} declare var SwarmFlagController: ISwarmFlagController;

declare interface ISwarmRoomObjectController extends ISwarmObjectController<SwarmControllerDataTypes.RoomObjects, TSwarmRoomObject> {

}