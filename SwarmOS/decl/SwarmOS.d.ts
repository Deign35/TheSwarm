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

declare type SwarmController<T extends StorageMemoryType, U> = {
    PrepareTheSwarm(): void;
    ActivateSwarm(): void;
    FinalizeSwarmActivity(): void;

    CreateSwarmObject(obj: U): void;
}

declare type SwarmQueen = SwarmController<StorageMemoryType.Room, Room> & {

}
declare type SwarmManager = SwarmController<StorageMemoryType.Creep, Creep> & {

}
declare type SwarmInfrastructure = SwarmController<StorageMemoryType.Structure, Structure> & {

}
declare type SwarmFlags = SwarmController<StorageMemoryType.Flag, Flag> & {

}