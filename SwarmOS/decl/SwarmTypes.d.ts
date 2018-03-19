declare interface ISwarmObject<T extends SwarmType, U extends RoomObject, V extends SwarmDataType> extends ISwarmObj<T, U, V> { }
declare interface INotifiableSwarmObject<T extends SwarmType, U extends Creep | Structure, V extends SwarmDataType> extends ISwarmObject<T, U, V> {
    //notifyWhenAttacked(notify: boolean): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_INVALID_ARGS;
}

declare interface IOwnableSwarmObject<T extends SwarmType, U extends Creep | OwnedStructure, V extends SwarmDataType> extends INotifiableSwarmObject<T, U, V> {

}
// Primary SwarmObjects
declare interface ISwarmCreep extends INotifiableSwarmObject<SwarmType.SwarmCreep, Creep, SwarmDataType.Creep> {

}
declare type TSwarmCreep = Creep & ISwarmCreep;

declare interface ISwarmFlag extends ISwarmObject<SwarmType.SwarmFlag, Flag, SwarmDataType.Flag> { }
declare type TSwarmFlag = Flag & ISwarmFlag;

declare interface ISwarmRoom extends ISwarmObj<SwarmType.SwarmRoom, Room, SwarmDataType.Room> { }
declare type TSwarmRoom = Room & ISwarmRoom;

// SwarmObjects
declare interface ISwarmRoomObject<T extends SwarmType, U extends RoomObject> extends ISwarmObject<T, U, SwarmDataType.RoomObject> {

}
declare interface ISwarmMineral extends ISwarmRoomObject<SwarmType.SwarmMineral, Mineral> { }
declare type TSwarmMineral = Mineral & ISwarmMineral;

declare interface ISwarmNuke extends ISwarmRoomObject<SwarmType.SwarmNuke, Nuke> { }
declare type TSwarmNuke = Nuke & ISwarmNuke

declare interface ISwarmResource extends ISwarmRoomObject<SwarmType.SwarmResource, Resource> { }
declare type TSwarmResource = Resource & ISwarmResource;

declare interface ISwarmSource extends ISwarmRoomObject<SwarmType.SwarmSource, Source> { }
declare type TSwarmSource = Source & ISwarmSource

declare interface ISwarmTombstone extends ISwarmRoomObject<SwarmType.SwarmTombstone, Tombstone> { }
declare type TSwarmTombstone = Tombstone & ISwarmTombstone;

declare interface ISwarmSite extends ISwarmRoomObject<SwarmType.SwarmSite, ConstructionSite> { }
declare type TSwarmSite = ConstructionSite & ISwarmSite;
// SwarmStructures
declare interface ISwarmStructure<T extends SwarmType, U extends Structure>
    extends INotifiableSwarmObject<T, U, SwarmDataType.Structure> {
    Modules: { [moduleType: number]: any };
}

declare interface ISwarmContainer extends ISwarmStructure<SwarmType.SwarmContainer, StructureContainer> {

}
declare type TSwarmContainer = StructureContainer & ISwarmContainer;

declare interface ISwarmRoad extends ISwarmStructure<SwarmType.SwarmRoad, StructureRoad> {

}
declare type TSwarmRoad = StructureRoad & ISwarmRoad

declare interface ISwarmWall extends ISwarmStructure<SwarmType.SwarmWall, StructureWall> {

}
declare type TSwarmWall = StructureWall & ISwarmWall;

declare interface ISwarmPowerBank extends ISwarmStructure<SwarmType.SwarmPowerBank, StructurePowerBank> {

}
declare type TSwarmPowerBank = StructurePowerBank & ISwarmPowerBank;

declare interface ISwarmPortal extends ISwarmStructure<SwarmType.SwarmPortal, StructurePortal> {

}
declare type TSwarmPortal = StructurePortal & ISwarmPortal;

// OwnableSwarmStructures
declare interface IOwnableSwarmStructure<T extends SwarmType, U extends OwnedStructure>
    extends ISwarmStructure<T, U> {

}

declare interface ISwarmController extends IOwnableSwarmStructure<SwarmType.SwarmController, StructureController> {

}
declare type TSwarmController = StructureController & ISwarmController;

declare interface ISwarmExtension extends IOwnableSwarmStructure<SwarmType.SwarmExtension, StructureExtension> {

}
declare type TSwarmExtension = StructureExtension & ISwarmExtension;

declare interface ISwarmExtractor extends IOwnableSwarmStructure<SwarmType.SwarmExtractor, StructureExtractor> {

}
declare type TSwarmExtractor = StructureExtractor & ISwarmExtractor

declare interface ISwarmKeeperLair extends IOwnableSwarmStructure<SwarmType.SwarmKeepersLair, StructureKeeperLair> {

}
declare type TSwarmKeeperLair = StructureKeeperLair & ISwarmKeeperLair

declare interface ISwarmLab extends IOwnableSwarmStructure<SwarmType.SwarmLab, StructureLab> {

}
declare type TSwarmLab = StructureLab & ISwarmLab

declare interface ISwarmLink extends IOwnableSwarmStructure<SwarmType.SwarmLink, StructureLink> { }
declare type TSwarmLink = StructureLink & ISwarmLink;

declare interface ISwarmNuker extends IOwnableSwarmStructure<SwarmType.SwarmNuker, StructureNuker> { }
declare type TSwarmNuker = StructureNuker & ISwarmNuker;

declare interface ISwarmObserver extends IOwnableSwarmStructure<SwarmType.SwarmObserver, StructureObserver> { }
declare type TSwarmObserver = StructureObserver & ISwarmObserver;

declare interface ISwarmPowerSpawn extends IOwnableSwarmStructure<SwarmType.SwarmPowerSpawn, StructurePowerSpawn> {

}
declare type TSwarmPowerSpawn = StructurePowerSpawn & ISwarmPowerSpawn;
declare interface ISwarmRampart extends IOwnableSwarmStructure<SwarmType.SwarmRampart, StructureRampart> { }
declare type TSwarmRampart = StructureRampart & ISwarmRampart;

declare interface ISwarmSpawn extends IOwnableSwarmStructure<SwarmType.SwarmSpawn, StructureSpawn> { }
declare type TSwarmSpawn = StructureSpawn & ISwarmSpawn;

declare interface ISwarmStorage extends IOwnableSwarmStructure<SwarmType.SwarmStorage, StructureStorage> { }
declare type TSwarmStorage = StructureStorage & ISwarmStorage;

declare interface ISwarmTerminal extends IOwnableSwarmStructure<SwarmType.SwarmTerminal, StructureTerminal> { }
declare type TSwarmTerminal = StructureTerminal & ISwarmTerminal;

declare interface ISwarmTower extends IOwnableSwarmStructure<SwarmType.SwarmTower, StructureTower> { }
declare type TSwarmTower = StructureTower & ISwarmTower;

declare type SwarmStructureType = SwarmType.SwarmContainer | SwarmType.SwarmController | SwarmType.SwarmExtension |
    SwarmType.SwarmExtractor | SwarmType.SwarmKeepersLair | SwarmType.SwarmLab | SwarmType.SwarmLink |
    SwarmType.SwarmNuker | SwarmType.SwarmObserver | SwarmType.SwarmPortal | SwarmType.SwarmPowerBank |
    SwarmType.SwarmPowerSpawn | SwarmType.SwarmRampart | SwarmType.SwarmRoad | SwarmType.SwarmSpawn |
    SwarmType.SwarmStorage | SwarmType.SwarmTerminal | SwarmType.SwarmTower | SwarmType.SwarmWall
declare type TSwarmStructure = TSwarmContainer | TSwarmController | TSwarmExtension | TSwarmExtractor |
    TSwarmLab | TSwarmLink | TSwarmNuker | TSwarmObserver | TSwarmRampart | TSwarmRoad |
    TSwarmSpawn | TSwarmStorage | TSwarmTerminal | TSwarmTower | TSwarmWall | TSwarmPortal |
    TSwarmPowerBank | TSwarmPowerSpawn | TSwarmKeeperLair;

declare type TSwarmRoomObject = (TSwarmSource | TSwarmMineral | TSwarmNuke | TSwarmTombstone |
    TSwarmSite | TSwarmResource);

declare type TSwarmObjectTypes = TSwarmStructure | TSwarmRoom | TSwarmCreep | TSwarmFlag | TSwarmRoomObject

declare type PrimaryObjectType = TSwarmStructure | TSwarmRoom | TSwarmCreep | TSwarmFlag;


declare interface ISwarmRoomController extends IMasterSwarmController<SwarmType.SwarmRoom, Room, SwarmDataType.Room> {
} declare var SwarmQueen: ISwarmRoomController;
declare interface ISwarmCreepController extends IMasterSwarmController<SwarmType.SwarmCreep, Creep, SwarmDataType.Creep> {
} declare var SwarmCreepController: ISwarmCreepController;
declare interface ISwarmStructureController extends IMasterSwarmController<SwarmStructureType, Structure, SwarmDataType.Structure> {
} declare var SwarmStructureController: ISwarmStructureController;
declare interface ISwarmFlagController extends IMasterSwarmController<SwarmType.SwarmFlag, Flag, SwarmDataType.Flag> {
} declare var SwarmFlagController: ISwarmFlagController;

declare interface IMasterSwarmController<T extends SwarmType, U extends Room | RoomObject, V extends SwarmDataType> {
    StorageType: V;
    GetSwarmObject(id: string): ISwarmObj<T, U, V>;
    PrepareTheSwarm(): void;
    ActivateSwarm(): void;
    FinalizeSwarmActivity(): void;
}
declare interface ISwarmObj<T extends SwarmType, U extends RoomObject | Room, V extends SwarmDataType> {
    swarmType: T;
    value: U;
    memType: V;
    saveID: string;
    IsActive: boolean;
    GetMemoryObject(): IEmptyMemory<V>
    Activate(): void;
    AssignMemory(mem: IEmptyMemory<V>): void;
    InitNewObject(): void;
    GetSpawnRequirements(): ISpawnRequirement;
}

declare interface ISpawnRequirement {
    [id: string]: any;
    priority: Priority;
    minBody: BodyPartConstant[];
    growthTemplate: BodyPartConstant[];
    neededIn: number;
}