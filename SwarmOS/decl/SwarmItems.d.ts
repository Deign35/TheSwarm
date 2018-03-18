declare interface ISwarmItem<T> {
    value: T;
    swarmType: SwarmType;
    saveID: string;
    IsActive: boolean;
    GetMemoryObject(): IStorageMemory<StorageMemoryType, StorageMemoryTypes>
    Activate(): void;
    AssignMemory(mem: IStorageMemory<StorageMemoryType, StorageMemoryTypes>): void;
    InitNewObject(): void;
    GetSpawnRequirements(): SpawnRequirement;
}

declare type SpawnRequirement = {
    priority: Priority;
    minBody: BodyPartConstant[];
    growthTemplate: BodyPartConstant[];
    neededIn: number;
}

declare interface ISwarmObject<T extends RoomObject> extends ISwarmItem<T> { }
declare interface INotifiableSwarmObject<T extends Creep | Structure | ConstructionSite> extends ISwarmObject<T> {
    notifyWhenAttacked(notify: boolean): OK | ERR_NOT_OWNER | ERR_BUSY | ERR_INVALID_ARGS;
}

declare interface IOwnableSwarmObject<T extends Creep | OwnedStructure | ConstructionSite> extends INotifiableSwarmObject<T> {

}
// Primary SwarmObjects
declare interface ISwarmCreep extends IOwnableSwarmObject<Creep> {

}
declare type TSwarmCreep = Creep & ISwarmCreep;

declare interface ISwarmFlag extends ISwarmObject<Flag> { }
declare type TSwarmFlag = Flag & ISwarmFlag;

declare interface ISwarmRoom extends ISwarmItem<Room> { }
declare type TSwarmRoom = Room & ISwarmRoom;

// SwarmObjects
declare interface ISwarmMineral extends ISwarmObject<Mineral> { }
declare type TSwarmMineral = Mineral & ISwarmMineral & ISwarmObject<Mineral>;

declare interface ISwarmNuke extends ISwarmObject<Nuke> { }
declare type TSwarmNuke = Nuke & ISwarmNuke & ISwarmObject<Nuke>;

declare interface ISwarmResource extends ISwarmObject<Resource> { }
declare type TSwarmResource = Resource & ISwarmObject<Resource>;

declare interface ISwarmSite extends IOwnableSwarmObject<ConstructionSite> { }
declare type TSwarmSite = ConstructionSite & ISwarmSite;

declare interface ISwarmSource extends ISwarmObject<Source> { }
declare type TSwarmSource = Source & ISwarmSource

// SwarmStructures
declare interface ISwarmStructure<T extends Structure>
    extends INotifiableSwarmObject<T> {
    Modules: { [moduleType: number]: any };
}

declare interface ISwarmContainer extends ISwarmStructure<StructureContainer> {

}
declare type TSwarmContainer = StructureContainer & ISwarmContainer;

declare interface ISwarmRoad extends ISwarmStructure<StructureRoad> {

}
declare type TSwarmRoad = StructureRoad & ISwarmRoad

declare interface ISwarmWall extends ISwarmStructure<StructureWall> {

}
declare type TSwarmWall = StructureWall & ISwarmWall;

declare interface ISwarmPowerBank extends ISwarmStructure<StructurePowerBank> {

}
declare type TSwarmPowerBank = StructurePowerBank & ISwarmPowerBank;

declare interface ISwarmPortal extends ISwarmStructure<StructurePortal> {

}
declare type TSwarmPortal = StructurePortal & ISwarmPortal;

// OwnableSwarmStructures
declare interface IOwnableSwarmStructure<T extends OwnedStructure>
    extends ISwarmStructure<T> {

}

declare interface ISwarmController extends IOwnableSwarmStructure<StructureController> {

}
declare type TSwarmController = StructureController & ISwarmController;

declare interface ISwarmExtension extends IOwnableSwarmStructure<StructureExtension> {

}
declare type TSwarmExtension = StructureExtension & ISwarmExtension;

declare interface ISwarmExtractor extends IOwnableSwarmStructure<StructureExtractor> {

}
declare type TSwarmExtractor = StructureExtractor & ISwarmExtractor

declare interface ISwarmKeeperLair extends IOwnableSwarmStructure<StructureKeeperLair> {

}
declare type TSwarmKeeperLair = StructureKeeperLair & ISwarmKeeperLair

declare interface ISwarmLab extends IOwnableSwarmStructure<StructureLab> {

}
declare type TSwarmLab = StructureLab & ISwarmLab

declare interface ISwarmLink extends IOwnableSwarmStructure<StructureLink> { }
declare type TSwarmLink = StructureLink & ISwarmLink;

declare interface ISwarmNuker extends IOwnableSwarmStructure<StructureNuker> { }
declare type TSwarmNuker = StructureNuker & ISwarmNuker;

declare interface ISwarmObserver extends IOwnableSwarmStructure<StructureObserver> { }
declare type TSwarmObserver = StructureObserver & ISwarmObserver;

declare interface ISwarmPowerSpawn extends IOwnableSwarmStructure<StructurePowerSpawn> {

}
declare type TSwarmPowerSpawn = StructurePowerSpawn & ISwarmPowerSpawn;
declare interface ISwarmRampart extends IOwnableSwarmStructure<StructureRampart> { }
declare type TSwarmRampart = StructureRampart & ISwarmRampart;

declare interface ISwarmSpawn extends IOwnableSwarmStructure<StructureSpawn> { }
declare type TSwarmSpawn = StructureSpawn & ISwarmSpawn;

declare interface ISwarmStorage extends IOwnableSwarmStructure<StructureStorage> { }
declare type TSwarmStorage = StructureStorage & ISwarmStorage;

declare interface ISwarmTerminal extends IOwnableSwarmStructure<StructureTerminal> { }
declare type TSwarmTerminal = StructureTerminal & ISwarmTerminal;

declare interface ISwarmTower extends IOwnableSwarmStructure<StructureTower> { }
declare type TSwarmTower = StructureTower & ISwarmTower;

declare interface ISwarmTombstone extends ISwarmObject<Tombstone> { }
declare type TSwarmTombstone = Tombstone & ISwarmTombstone;

declare type TSwarmStructure = TSwarmContainer | TSwarmController | TSwarmExtension | TSwarmExtractor |
    TSwarmLab | TSwarmLink | TSwarmNuker | TSwarmObserver | TSwarmRampart | TSwarmRoad |
    TSwarmSpawn | TSwarmStorage | TSwarmTerminal | TSwarmTower | TSwarmWall | TSwarmPortal |
    TSwarmPowerBank | TSwarmPowerSpawn | TSwarmKeeperLair;

declare type TSwarmRoomObject = (TSwarmSource | TSwarmMineral | TSwarmNuke | TSwarmTombstone |
    TSwarmSite | TSwarmResource);

declare type TSwarmObjectTypes = TSwarmStructure | TSwarmRoom | TSwarmCreep | TSwarmFlag | TSwarmRoomObject

declare interface SwarmController<U extends TSwarmObjectTypes> {
    StorageType: StorageMemoryType;
    PrepareTheSwarm(): void;
    ActivateSwarm(): void;
    FinalizeSwarmActivity(): void;
    GetSwarmObject(id: string): U;
}

declare interface ISwarmQueen extends SwarmController<TSwarmRoom> {
} declare var SwarmQueen: ISwarmQueen;
declare interface ISwarmCreepController extends SwarmController<TSwarmCreep> {
} declare var SwarmCreepController: ISwarmCreepController;
declare interface ISwarmStructureController extends SwarmController<TSwarmStructure> {
} declare var SwarmStructureController: ISwarmStructureController;
declare interface ISwarmFlagController extends SwarmController<TSwarmFlag> {
} declare var SwarmFlagController: ISwarmFlagController;

declare interface ISwarmRoomObjectController extends SwarmController<TSwarmRoomObject> {

}