declare interface ISwarmItem<T> { }
declare type TSwarmItem<T> = T;

/*declare interface ISwarmPosition<T extends RoomPosition> extends ISwarmItem<T> { }
declare type SwarmPosition<T extends RoomPosition> = ISwarmPosition<T> & T;*/

declare interface ISwarmObject<T extends RoomObject> extends ISwarmItem<T> { }
declare type TSwarmObject<T extends RoomObject> = TSwarmItem<T> & ISwarmObject<T> & T;

declare interface ISwarmObjWithID<T extends RoomObject> extends ISwarmObject<T> {
    id: string;
}
declare type TSwarmObjWithID<T extends RoomObject> = ISwarmObjWithID<T> & TSwarmObject<T> & T

declare interface INotifiableSwarmObject<T extends Creep | Structure | ConstructionSite> extends ISwarmObjWithID<T> {
    notifyWhenAttacked(notify: boolean): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_INVALID_ARGS;
}
declare type TNotifiableSwarmObject<T extends Creep | Structure | ConstructionSite> = INotifiableSwarmObject<T> & TSwarmObjWithID<T> & T

declare interface IOwnableSwarmObject<T extends Creep | OwnedStructure | ConstructionSite> extends INotifiableSwarmObject<T> { }
declare type TOwnableSwarmObject<T extends Creep | OwnedStructure | ConstructionSite> = IOwnableSwarmObject<T> & TNotifiableSwarmObject<T> & T;

// Primary SwarmObjects
declare interface ISwarmCreep extends IOwnableSwarmObject<Creep> { }
declare type TSwarmCreep = Creep & ISwarmCreep & TOwnableSwarmObject<Creep>
declare function MakeSwarmCreep(creep: Creep): TSwarmCreep;

declare interface ISwarmFlag extends ISwarmObject<Flag> { }
declare type TSwarmFlag = Flag & ISwarmFlag & TSwarmObject<Flag>;
declare function MakeSwarmFlag(flag: Flag): TSwarmFlag;

declare interface ISwarmRoom extends ISwarmItem<Room> { }
declare type TSwarmRoom = Room & ISwarmRoom & TSwarmItem<Room>;
declare function MakeSwarmRoom(room: Room): TSwarmRoom;

// SwarmObjects

declare interface ISwarmMineral extends ISwarmObjWithID<Mineral> { }
declare type TSwarmMineral = Mineral & ISwarmMineral & TSwarmObjWithID<Mineral>;
declare function MakeSwarmMineral(mineral: Mineral): TSwarmMineral;

declare interface ISwarmNuke extends ISwarmObjWithID<Nuke> { }
declare type TSwarmNuke = Nuke & ISwarmNuke & TSwarmObjWithID<Nuke>;
declare function MakeSwarmNuke(nuke: Nuke): TSwarmNuke;

declare interface ISwarmResource extends ISwarmObjWithID<Resource> { }
declare type TSwarmResource = Resource & TSwarmObjWithID<Resource>;
declare function MakeSwarmResource(resource: Resource): TSwarmResource;

declare interface ISwarmSite extends IOwnableSwarmObject<ConstructionSite> { }
declare type TSwarmSite = ISwarmSite & TOwnableSwarmObject<ConstructionSite> & ConstructionSite;
declare function CreateSwarmSite(site: ConstructionSite): TSwarmSite;

declare interface ISwarmSource extends ISwarmObjWithID<Source> { }
declare type TSwarmSource = Source & ISwarmSource & TSwarmObjWithID<Source>
declare function MakeSwarmSource(source: Source): TSwarmSource;

// SwarmStructures
declare interface ISwarmStructure<T extends Structure> extends INotifiableSwarmObject<T> { }
declare type TSwarmStructure<T extends Structure> = T & TNotifiableSwarmObject<T>;

declare interface ISwarmContainer extends ISwarmStructure<StructureContainer> { }
declare type TSwarmContainer = StructureContainer & ISwarmContainer & TSwarmStructure<StructureContainer>
declare function MakeSwarmContainer(container: StructureContainer): TSwarmContainer;

declare interface ISwarmRoad extends ISwarmStructure<StructureRoad> { }
declare type TSwarmRoad = StructureRoad & ISwarmRoad & TSwarmStructure<StructureRoad>
declare function MakeSwarmRoad(Road: StructureRoad): TSwarmRoad;

declare interface ISwarmWall extends ISwarmStructure<StructureWall> { }
declare type TSwarmWall = StructureWall & ISwarmWall & TSwarmStructure<StructureWall>
declare function MakeSwarmWall(Wall: StructureWall): TSwarmWall;

// StructurePowerBank
// StructurePortal 

// OwnableSwarmStructures
declare interface IOwnableSwarmStructure<T extends OwnedStructure> extends ISwarmStructure<T> { }
declare type TOwnableSwarmStructure<T extends OwnedStructure> = T & TSwarmStructure<T> & IOwnableSwarmObject<T>;

declare interface ISwarmController extends IOwnableSwarmStructure<StructureController> { }
declare type TSwarmController = StructureController & ISwarmController & TOwnableSwarmStructure<StructureController>
declare function MakeSwarmController(controller: StructureController): TSwarmController;

declare interface ISwarmExtension extends IOwnableSwarmStructure<StructureExtension> { }
declare type TSwarmExtension = StructureExtension & ISwarmExtension & TOwnableSwarmStructure<StructureExtension>
declare function MakeSwarmExtension(extension: StructureExtension): TSwarmExtension;

declare interface ISwarmExtractor extends IOwnableSwarmStructure<StructureExtractor> { }
declare type TSwarmExtractor = StructureExtractor & ISwarmExtractor & TOwnableSwarmStructure<StructureExtractor>
declare function MakeSwarmExtractor(extractor: StructureExtractor): TSwarmExtractor;

// StructureKeeperLair
declare interface ISwarmLab extends IOwnableSwarmStructure<StructureLab> { }
declare type TSwarmLab = StructureLab & ISwarmLab & TOwnableSwarmStructure<StructureLab>
declare function MakeSwarmLab(lab: StructureLab): TSwarmLab;

declare interface ISwarmLink extends IOwnableSwarmStructure<StructureLink> { }
declare type TSwarmLink = StructureLink & ISwarmLink & TOwnableSwarmStructure<StructureLink>
declare function MakeSwarmLink(link: StructureLink): TSwarmLink;

declare interface ISwarmNuker extends IOwnableSwarmStructure<StructureNuker> { }
declare type TSwarmNuker = StructureNuker & ISwarmNuker & TOwnableSwarmStructure<StructureNuker>
declare function MakeSwarmNuker(Nuker: StructureNuker): TSwarmNuker;

declare interface ISwarmObserver extends IOwnableSwarmStructure<StructureObserver> { }
declare type TSwarmObserver = StructureObserver & ISwarmObserver & TOwnableSwarmStructure<StructureObserver>
declare function MakeSwarmObserver(Observer: StructureObserver): TSwarmObserver;

// StructurePowerSpawn 
declare interface ISwarmRampart extends IOwnableSwarmStructure<StructureRampart> { }
declare type TSwarmRampart = StructureRampart & ISwarmRampart & TOwnableSwarmStructure<StructureRampart>
declare function MakeSwarmRampart(Rampart: StructureRampart): TSwarmRampart;

declare interface ISwarmSpawn extends IOwnableSwarmStructure<StructureSpawn> { }
declare type TSwarmSpawn = StructureSpawn & ISwarmSpawn & TOwnableSwarmStructure<StructureSpawn>
declare function MakeSwarmSpawn(Spawn: StructureSpawn): TSwarmSpawn;

declare interface ISwarmStorage extends IOwnableSwarmStructure<StructureStorage> { }
declare type TSwarmStorage = StructureStorage & ISwarmStorage & TOwnableSwarmStructure<StructureStorage>
declare function MakeSwarmStorage(Storage: StructureStorage): TSwarmStorage;

declare interface ISwarmTerminal extends IOwnableSwarmStructure<StructureTerminal> { }
declare type TSwarmTerminal = StructureTerminal & ISwarmTerminal & TOwnableSwarmStructure<StructureTerminal>
declare function MakeSwarmTerminal(Terminal: StructureTerminal): TSwarmTerminal;

declare interface ISwarmTower extends IOwnableSwarmStructure<StructureTower> { }
declare type TSwarmTower = StructureTower & ISwarmTower & TOwnableSwarmStructure<StructureTower>
declare function MakeSwarmTower(Tower: StructureTower): TSwarmTower;

// SwarmTombstone
declare interface ISwarmTombstone extends ISwarmObjWithID<Tombstone> { }
declare type TSwarmTombstone = Tombstone & ISwarmTombstone & TSwarmObjWithID<Tombstone>;
declare function MakeSwarmTombstone(tombstone: Tombstone): TSwarmTombstone;