declare interface IImperator {
    ActivateCreep(creep: Creep): void;
}
declare interface IConsul {
    SetTarget(target: number): void;
    NeedsCapacityIncreased: boolean;
}
declare interface IQueen {
    Council: IDictionary<IConsul>;
    CreepController: ICreepManager;
    QueenType: number
    ReceiveCommand(): void;

    StartTick(): void;
    ProcessTick(): void;
    EndTick(): void;
}

declare interface ICreepManager {
    StartTick(): void;
    ProcessTick(): void;
    EndTick(): void;
}

declare type ConsulCensus = {
    currentRate: number
}
declare type QueenCensus = {
    [consulName: string]: ConsulCensus;
}

declare var MasterStructureController: any;

declare interface ISwarmController<T extends StorageMemoryType, U> {
    PrepareTheSwarm(): void;
    ActivateSwarm(): void;
    FinalizeSwarmActivity(): void;

    CreateSwarmObject(obj: U): void;
}

declare interface ISwarmQueen extends ISwarmController<StorageMemoryType.Room, Room> {

} declare var SwarmQueen: ISwarmQueen;
declare interface ISwarmManager extends ISwarmController<StorageMemoryType.Creep, Creep> {

} declare var SwarmManager: ISwarmManager;
declare interface ISwarmInfrastructure extends ISwarmController<StorageMemoryType.Structure, Structure> {

}
declare interface ISwarmFlags extends ISwarmController<StorageMemoryType.Flag, Flag> {

}