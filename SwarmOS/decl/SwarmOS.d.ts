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

declare var SwarmLogger: {
    Log(message: string, level?: LogLevel): void;
    LogWarning(message: string): void;
    LogError(message: string): void;
}