declare interface ISwarmItem<T, U extends SwarmType> {
    swarmType: U;
}
declare type TSwarmItem<T, U> = T & {
    swarmType: U;
};

/*declare interface ISwarmPosition<T extends RoomPosition> extends ISwarmItem<T> { }
declare type SwarmPosition<T extends RoomPosition> = ISwarmPosition<T> & T;*/

declare interface ISwarmObject<T extends RoomObject, U extends SwarmType> extends ISwarmItem<T, U> { }
declare type TSwarmObject<T extends RoomObject, U extends SwarmType> = TSwarmItem<T, U> & ISwarmObject<T, U> & T;

declare interface ISwarmObjWithID<T extends RoomObject, U extends SwarmType> extends ISwarmObject<T, U> {
    id: string;
}
declare type TSwarmObjWithID<T extends RoomObject, U extends SwarmType> = ISwarmObjWithID<T, U> & TSwarmObject<T, U> & T

declare interface INotifiableSwarmObject<T extends Creep | Structure | ConstructionSite, U extends SwarmType> extends ISwarmObjWithID<T, U> {
    notifyWhenAttacked(notify: boolean): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_INVALID_ARGS;
}
declare type TNotifiableSwarmObject<T extends Creep | Structure | ConstructionSite, U extends SwarmType> = INotifiableSwarmObject<T, U> & TSwarmObjWithID<T, U> & T

declare interface IOwnableSwarmObject<T extends Creep | OwnedStructure | ConstructionSite, U extends SwarmType> extends INotifiableSwarmObject<T, U> { }
declare type TOwnableSwarmObject<T extends Creep | OwnedStructure | ConstructionSite, U extends SwarmType> = IOwnableSwarmObject<T, U> & TNotifiableSwarmObject<T, U> & T;

// Primary SwarmObjects
declare interface ISwarmCreep extends IOwnableSwarmObject<Creep, SwarmType.SwarmCreep> { }
declare type TSwarmCreep = Creep & ISwarmCreep & TOwnableSwarmObject<Creep, SwarmType.SwarmCreep> & PrimaryTypeFunctions;
declare function MakeSwarmCreep(creep: Creep): TSwarmCreep;

declare interface ISwarmFlag extends ISwarmObject<Flag, SwarmType.SwarmFlag> { }
declare type TSwarmFlag = Flag & ISwarmFlag & TSwarmObject<Flag, SwarmType.SwarmFlag> & PrimaryTypeFunctions;
declare function MakeSwarmFlag(flag: Flag): TSwarmFlag;

declare interface ISwarmRoom extends ISwarmItem<Room, SwarmType.SwarmRoom> { }
declare type TSwarmRoom = Room & ISwarmRoom & TSwarmItem<Room, SwarmType.SwarmRoom> & PrimaryTypeFunctions;
declare function MakeSwarmRoom(room: Room): TSwarmRoom;

// SwarmObjects

declare interface ISwarmMineral extends ISwarmObjWithID<Mineral, SwarmType.SwarmMineral> { }
declare type TSwarmMineral = Mineral & ISwarmMineral & TSwarmObjWithID<Mineral, SwarmType.SwarmMineral>;
declare function MakeSwarmMineral(mineral: Mineral): TSwarmMineral;

declare interface ISwarmNuke extends ISwarmObjWithID<Nuke, SwarmType.SwarmNuke> { }
declare type TSwarmNuke = Nuke & ISwarmNuke & TSwarmObjWithID<Nuke, SwarmType.SwarmNuke>;
declare function MakeSwarmNuke(nuke: Nuke): TSwarmNuke;

declare interface ISwarmResource extends ISwarmObjWithID<Resource, SwarmType.SwarmResource> { }
declare type TSwarmResource = Resource & TSwarmObjWithID<Resource, SwarmType.SwarmResource>;
declare function MakeSwarmResource(resource: Resource): TSwarmResource;

declare interface ISwarmSite extends IOwnableSwarmObject<ConstructionSite, SwarmType.SwarmSite> { }
declare type TSwarmSite = ISwarmSite & TOwnableSwarmObject<ConstructionSite, SwarmType.SwarmSite> & ConstructionSite;
declare function CreateSwarmSite(site: ConstructionSite): TSwarmSite;

declare interface ISwarmSource extends ISwarmObjWithID<Source, SwarmType.SwarmSource> { }
declare type TSwarmSource = Source & ISwarmSource & TSwarmObjWithID<Source, SwarmType.SwarmSource>
declare function MakeSwarmSource(source: Source): TSwarmSource;

// SwarmStructures
declare interface ISwarmStructure<T extends Structure, U extends SwarmType> extends INotifiableSwarmObject<T, U> { }
declare type TSwarmStructure<T extends Structure, U extends SwarmType> = T & TNotifiableSwarmObject<T, U> & ISwarmStructure<T, U> & PrimaryTypeFunctions;

declare interface ISwarmContainer extends ISwarmStructure<StructureContainer, SwarmType.SwarmContainer> { }
declare type TSwarmContainer = StructureContainer & ISwarmContainer & TSwarmStructure<StructureContainer, SwarmType.SwarmContainer>
declare function MakeSwarmContainer(container: StructureContainer): TSwarmContainer;

declare interface ISwarmRoad extends ISwarmStructure<StructureRoad, SwarmType.SwarmRoad> { }
declare type TSwarmRoad = StructureRoad & ISwarmRoad & TSwarmStructure<StructureRoad, SwarmType.SwarmRoad>
declare function MakeSwarmRoad(Road: StructureRoad): TSwarmRoad;

declare interface ISwarmWall extends ISwarmStructure<StructureWall, SwarmType.SwarmWall> { }
declare type TSwarmWall = StructureWall & ISwarmWall & TSwarmStructure<StructureWall, SwarmType.SwarmWall>
declare function MakeSwarmWall(Wall: StructureWall): TSwarmWall;

// StructurePowerBank
// StructurePortal 

// OwnableSwarmStructures
declare interface IOwnableSwarmStructure<T extends OwnedStructure, U extends SwarmType> extends ISwarmStructure<T, U> { }
declare type TOwnableSwarmStructure<T extends OwnedStructure, U extends SwarmType> = T & TSwarmStructure<T, U> & IOwnableSwarmObject<T, U>;

declare interface ISwarmController extends IOwnableSwarmStructure<StructureController, SwarmType.SwarmController> { }
declare type TSwarmController = StructureController & ISwarmController & TOwnableSwarmStructure<StructureController, SwarmType.SwarmController>
declare function MakeSwarmController(controller: StructureController): TSwarmController;

declare interface ISwarmExtension extends IOwnableSwarmStructure<StructureExtension, SwarmType.SwarmExtension> { }
declare type TSwarmExtension = StructureExtension & ISwarmExtension & TOwnableSwarmStructure<StructureExtension, SwarmType.SwarmExtension>
declare function MakeSwarmExtension(extension: StructureExtension): TSwarmExtension;

declare interface ISwarmExtractor extends IOwnableSwarmStructure<StructureExtractor, SwarmType.SwarmExtractor> { }
declare type TSwarmExtractor = StructureExtractor & ISwarmExtractor & TOwnableSwarmStructure<StructureExtractor, SwarmType.SwarmExtractor>
declare function MakeSwarmExtractor(extractor: StructureExtractor): TSwarmExtractor;

// StructureKeeperLair
declare interface ISwarmLab extends IOwnableSwarmStructure<StructureLab, SwarmType.SwarmLab> { }
declare type TSwarmLab = StructureLab & ISwarmLab & TOwnableSwarmStructure<StructureLab, SwarmType.SwarmLab>
declare function MakeSwarmLab(lab: StructureLab): TSwarmLab;

declare interface ISwarmLink extends IOwnableSwarmStructure<StructureLink, SwarmType.SwarmLink> { }
declare type TSwarmLink = StructureLink & ISwarmLink & TOwnableSwarmStructure<StructureLink, SwarmType.SwarmLink>
declare function MakeSwarmLink(link: StructureLink): TSwarmLink;

declare interface ISwarmNuker extends IOwnableSwarmStructure<StructureNuker, SwarmType.SwarmNuker> { }
declare type TSwarmNuker = StructureNuker & ISwarmNuker & TOwnableSwarmStructure<StructureNuker, SwarmType.SwarmNuker>
declare function MakeSwarmNuker(Nuker: StructureNuker): TSwarmNuker;

declare interface ISwarmObserver extends IOwnableSwarmStructure<StructureObserver, SwarmType.SwarmObserver> { }
declare type TSwarmObserver = StructureObserver & ISwarmObserver & TOwnableSwarmStructure<StructureObserver, SwarmType.SwarmObserver>
declare function MakeSwarmObserver(Observer: StructureObserver): TSwarmObserver;

// StructurePowerSpawn 
declare interface ISwarmRampart extends IOwnableSwarmStructure<StructureRampart, SwarmType.SwarmRampart> { }
declare type TSwarmRampart = StructureRampart & ISwarmRampart & TOwnableSwarmStructure<StructureRampart, SwarmType.SwarmRampart>
declare function MakeSwarmRampart(Rampart: StructureRampart): TSwarmRampart;

declare interface ISwarmSpawn extends IOwnableSwarmStructure<StructureSpawn, SwarmType.SwarmSpawn> { }
declare type TSwarmSpawn = StructureSpawn & ISwarmSpawn & TOwnableSwarmStructure<StructureSpawn, SwarmType.SwarmSpawn>
declare function MakeSwarmSpawn(Spawn: StructureSpawn): TSwarmSpawn;

declare interface ISwarmStorage extends IOwnableSwarmStructure<StructureStorage, SwarmType.SwarmStorage> { }
declare type TSwarmStorage = StructureStorage & ISwarmStorage & TOwnableSwarmStructure<StructureStorage, SwarmType.SwarmStorage>
declare function MakeSwarmStorage(Storage: StructureStorage): TSwarmStorage;

declare interface ISwarmTerminal extends IOwnableSwarmStructure<StructureTerminal, SwarmType.SwarmTerminal> { }
declare type TSwarmTerminal = StructureTerminal & ISwarmTerminal & TOwnableSwarmStructure<StructureTerminal, SwarmType.SwarmTerminal>
declare function MakeSwarmTerminal(Terminal: StructureTerminal): TSwarmTerminal;

declare interface ISwarmTower extends IOwnableSwarmStructure<StructureTower, SwarmType.SwarmTower> { }
declare type TSwarmTower = StructureTower & ISwarmTower & TOwnableSwarmStructure<StructureTower, SwarmType.SwarmTower>
declare function MakeSwarmTower(Tower: StructureTower): TSwarmTower;

// SwarmTombstone
declare interface ISwarmTombstone extends ISwarmObjWithID<Tombstone, SwarmType.SwarmTombstone> { }
declare type TSwarmTombstone = Tombstone & ISwarmTombstone & TSwarmObjWithID<Tombstone, SwarmType.SwarmTombstone>;
declare function MakeSwarmTombstone(tombstone: Tombstone): TSwarmTombstone;

declare type SwarmStructures = TSwarmContainer | TSwarmController | TSwarmExtension | TSwarmExtractor |
    TSwarmLab | TSwarmLink | TSwarmNuker | TSwarmObserver | TSwarmRampart | TSwarmRoad |
    TSwarmSpawn | TSwarmStorage | TSwarmTerminal | TSwarmTower | TSwarmWall;
declare type PrimarySwarmTypes = (TSwarmRoom | TSwarmCreep | TSwarmFlag | SwarmStructures);

declare type PrimaryTypeFunctions = {
    StartTick(): void;
    ProcessTick(): void;
    EndTick(): void;
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
declare interface ISwarmStructureController extends SwarmController<StorageMemoryType.Structure, SwarmStructures> {

} declare var SwarmStructureController: ISwarmStructureController;
declare interface ISwarmFlags extends SwarmController<StorageMemoryType.Flag, TSwarmFlag> {

}declare var SwarmFlagController: ISwarmFlags;