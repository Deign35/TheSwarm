declare interface ISwarmItem<T, U extends SwarmType, V extends StorageMemoryTypes> {
    value: T;
    swarmType: U;
    GetMemoryObject(): IStorageMemory<V>
}
declare type TSwarmItem<T, U extends SwarmType, V extends StorageMemoryTypes> = T & ISwarmItem<T, U, V>

declare interface ISwarmObject<T extends RoomObject, U extends SwarmType, V extends StorageMemoryTypes>
    extends ISwarmItem<T, U, V> {
}
declare type TSwarmObject<T extends RoomObject, U extends SwarmType, V extends StorageMemoryTypes>
    = TSwarmItem<T, U, V> & ISwarmObject<T, U, V> & T;

declare interface ISwarmObjWithID<T extends RoomObject, U extends SwarmType, V extends StorageMemoryTypes>
    extends ISwarmObject<T, U, V> {
    id: string;
}
declare type TSwarmObjWithID<T extends RoomObject, U extends SwarmType, V extends StorageMemoryTypes> =
    ISwarmObjWithID<T, U, V> & TSwarmObject<T, U, V> & T

declare interface INotifiableSwarmObject<T extends Creep | Structure | ConstructionSite, U extends SwarmType,
    V extends StorageMemoryTypes> extends ISwarmObjWithID<T, U, V> {
    notifyWhenAttacked(notify: boolean): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_INVALID_ARGS;
}
declare type TNotifiableSwarmObject<T extends Creep | Structure | ConstructionSite, U extends SwarmType,
    V extends StorageMemoryTypes> = INotifiableSwarmObject<T, U, V> & TSwarmObjWithID<T, U, V> & T

declare interface IOwnableSwarmObject<T extends Creep | OwnedStructure | ConstructionSite,
    U extends SwarmType, V extends StorageMemoryTypes> extends INotifiableSwarmObject<T, U, V> { }
declare type TOwnableSwarmObject<T extends Creep | OwnedStructure | ConstructionSite,
    U extends SwarmType, V extends StorageMemoryTypes> = IOwnableSwarmObject<T, U, V> & TNotifiableSwarmObject<T, U, V> & T;

// Primary SwarmObjects
declare interface ISwarmCreep extends IOwnableSwarmObject<Creep, SwarmType.SwarmCreep, CreepData> { }
declare type TSwarmCreep = Creep & ISwarmCreep & TOwnableSwarmObject<Creep, SwarmType.SwarmCreep, CreepData> & PrimaryTypeFunctions;

declare interface ISwarmFlag extends ISwarmObject<Flag, SwarmType.SwarmFlag, FlagData> { }
declare type TSwarmFlag = Flag & ISwarmFlag & TSwarmObject<Flag, SwarmType.SwarmFlag, FlagData> & PrimaryTypeFunctions;

declare interface ISwarmRoom extends ISwarmItem<Room, SwarmType.SwarmRoom, RoomData> { }
declare type TSwarmRoom = Room & ISwarmRoom & TSwarmItem<Room, SwarmType.SwarmRoom, RoomData> & PrimaryTypeFunctions;

// SwarmObjects

declare interface ISwarmMineral extends ISwarmObjWithID<Mineral, SwarmType.SwarmMineral, RoomObjectData> { }
declare type TSwarmMineral = Mineral & ISwarmMineral & TSwarmObjWithID<Mineral, SwarmType.SwarmMineral, RoomObjectData>;

declare interface ISwarmNuke extends ISwarmObjWithID<Nuke, SwarmType.SwarmNuke, RoomObjectData> { }
declare type TSwarmNuke = Nuke & ISwarmNuke & TSwarmObjWithID<Nuke, SwarmType.SwarmNuke, RoomObjectData>;

declare interface ISwarmResource extends ISwarmObjWithID<Resource, SwarmType.SwarmResource, RoomObjectData> { }
declare type TSwarmResource = Resource & TSwarmObjWithID<Resource, SwarmType.SwarmResource, RoomObjectData>;

declare interface ISwarmSite extends IOwnableSwarmObject<ConstructionSite, SwarmType.SwarmSite, RoomObjectData> { }
declare type TSwarmSite = ISwarmSite & TOwnableSwarmObject<ConstructionSite, SwarmType.SwarmSite, RoomObjectData> & ConstructionSite;

declare type TEMP_SpawnReqType = {
    minBody: BodyPartConstant[],
    bodyExtension?: BodyPartConstant[],
    priority: Priority
}
declare interface ISwarmSource extends ISwarmObjWithID<Source, SwarmType.SwarmSource, RoomObjectData> { }
declare type TSwarmSource = Source & ISwarmSource & TSwarmObjWithID<Source, SwarmType.SwarmSource, RoomObjectData>

// SwarmStructures
declare interface ISwarmStructure<T extends Structure, U extends SwarmType> extends INotifiableSwarmObject<T, U, StructureData> {
    Modules: { [moduleType: number]: any };
}
declare type TSwarmStructure<T extends Structure, U extends SwarmType> = T & TNotifiableSwarmObject<T, U, StructureData> & ISwarmStructure<T, U> & PrimaryTypeFunctions;

declare interface ISwarmContainer extends ISwarmStructure<StructureContainer, SwarmType.SwarmContainer> { }
declare type TSwarmContainer = StructureContainer & ISwarmContainer & TSwarmStructure<StructureContainer, SwarmType.SwarmContainer>

declare interface ISwarmRoad extends ISwarmStructure<StructureRoad, SwarmType.SwarmRoad> { }
declare type TSwarmRoad = StructureRoad & ISwarmRoad & TSwarmStructure<StructureRoad, SwarmType.SwarmRoad>

declare interface ISwarmWall extends ISwarmStructure<StructureWall, SwarmType.SwarmWall> { }
declare type TSwarmWall = StructureWall & ISwarmWall & TSwarmStructure<StructureWall, SwarmType.SwarmWall>

// StructurePowerBank
// StructurePortal 

// OwnableSwarmStructures
declare interface IOwnableSwarmStructure<T extends OwnedStructure, U extends SwarmType> extends ISwarmStructure<T, U> { }
declare type TOwnableSwarmStructure<T extends OwnedStructure, U extends SwarmType> = T & TSwarmStructure<T, U> & IOwnableSwarmObject<T, U, StructureData>;

declare interface ISwarmController extends IOwnableSwarmStructure<StructureController, SwarmType.SwarmController> { }
declare type TSwarmController = StructureController & ISwarmController & TOwnableSwarmStructure<StructureController, SwarmType.SwarmController>

declare interface ISwarmExtension extends IOwnableSwarmStructure<StructureExtension, SwarmType.SwarmExtension> { }
declare type TSwarmExtension = StructureExtension & ISwarmExtension & TOwnableSwarmStructure<StructureExtension, SwarmType.SwarmExtension>

declare interface ISwarmExtractor extends IOwnableSwarmStructure<StructureExtractor, SwarmType.SwarmExtractor> { }
declare type TSwarmExtractor = StructureExtractor & ISwarmExtractor & TOwnableSwarmStructure<StructureExtractor, SwarmType.SwarmExtractor>

// StructureKeeperLair
declare interface ISwarmLab extends IOwnableSwarmStructure<StructureLab, SwarmType.SwarmLab> { }
declare type TSwarmLab = StructureLab & ISwarmLab & TOwnableSwarmStructure<StructureLab, SwarmType.SwarmLab>

declare interface ISwarmLink extends IOwnableSwarmStructure<StructureLink, SwarmType.SwarmLink> { }
declare type TSwarmLink = StructureLink & ISwarmLink & TOwnableSwarmStructure<StructureLink, SwarmType.SwarmLink>

declare interface ISwarmNuker extends IOwnableSwarmStructure<StructureNuker, SwarmType.SwarmNuker> { }
declare type TSwarmNuker = StructureNuker & ISwarmNuker & TOwnableSwarmStructure<StructureNuker, SwarmType.SwarmNuker>

declare interface ISwarmObserver extends IOwnableSwarmStructure<StructureObserver, SwarmType.SwarmObserver> { }
declare type TSwarmObserver = StructureObserver & ISwarmObserver & TOwnableSwarmStructure<StructureObserver, SwarmType.SwarmObserver>

// StructurePowerSpawn 
declare interface ISwarmRampart extends IOwnableSwarmStructure<StructureRampart, SwarmType.SwarmRampart> { }
declare type TSwarmRampart = StructureRampart & ISwarmRampart & TOwnableSwarmStructure<StructureRampart, SwarmType.SwarmRampart>

declare interface ISwarmSpawn extends IOwnableSwarmStructure<StructureSpawn, SwarmType.SwarmSpawn> { }
declare type TSwarmSpawn = StructureSpawn & ISwarmSpawn & TOwnableSwarmStructure<StructureSpawn, SwarmType.SwarmSpawn>

declare interface ISwarmStorage extends IOwnableSwarmStructure<StructureStorage, SwarmType.SwarmStorage> { }
declare type TSwarmStorage = StructureStorage & ISwarmStorage & TOwnableSwarmStructure<StructureStorage, SwarmType.SwarmStorage>

declare interface ISwarmTerminal extends IOwnableSwarmStructure<StructureTerminal, SwarmType.SwarmTerminal> { }
declare type TSwarmTerminal = StructureTerminal & ISwarmTerminal & TOwnableSwarmStructure<StructureTerminal, SwarmType.SwarmTerminal>

declare interface ISwarmTower extends IOwnableSwarmStructure<StructureTower, SwarmType.SwarmTower> { }
declare type TSwarmTower = StructureTower & ISwarmTower & TOwnableSwarmStructure<StructureTower, SwarmType.SwarmTower>

// SwarmTombstone
declare interface ISwarmTombstone extends ISwarmObjWithID<Tombstone, SwarmType.SwarmTombstone, RoomObjectData> { }
declare type TSwarmTombstone = Tombstone & ISwarmTombstone & TSwarmObjWithID<Tombstone, SwarmType.SwarmTombstone, RoomObjectData>;

declare type SwarmStructureTypes = (TSwarmContainer | TSwarmController | TSwarmExtension | TSwarmExtractor |
    TSwarmLab | TSwarmLink | TSwarmNuker | TSwarmObserver | TSwarmRampart | TSwarmRoad |
    TSwarmSpawn | TSwarmStorage | TSwarmTerminal | TSwarmTower | TSwarmWall) & PrimaryTypeFunctions;
declare type PrimarySwarmTypes = (TSwarmRoom | TSwarmCreep | TSwarmFlag | SwarmStructureTypes);

declare type PrimaryTypeFunctions = {
    GetMemoryObject(): IStorageMemory<StorageMemoryTypes>;
};


declare interface SwarmController<T extends StorageMemoryType, U extends PrimarySwarmTypes> {
    StorageType: T;
    PrepareTheSwarm(): void;
    ActivateSwarm(): void;
    FinalizeSwarmActivity(): void;
}

declare interface ISwarmQueen extends SwarmController<StorageMemoryType.Room, TSwarmRoom> {

} declare var SwarmQueen: ISwarmQueen;
declare interface ISwarmCreepController extends SwarmController<StorageMemoryType.Creep, TSwarmCreep> {

} declare var SwarmCreepController: ISwarmCreepController;
declare interface ISwarmStructureController extends SwarmController<StorageMemoryType.Structure, SwarmStructureTypes> {

} declare var SwarmStructureController: ISwarmStructureController;
declare interface ISwarmFlagController extends SwarmController<StorageMemoryType.Flag, TSwarmFlag> {

} declare var SwarmFlagController: ISwarmFlagController;