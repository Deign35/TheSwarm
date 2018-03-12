declare interface IImperator {
    ActivateCreep(creep: Creep): void;
}
declare interface IConsul {
    SetTarget(target: number): void;
    NeedsCapacityIncreased: boolean;
}
declare interface ISwarmQueen {

}
declare interface IQueen {
    Council: IDictionary<IConsul>;
    CreepController: CreepManager;
    QueenType: number
    ReceiveCommand(): void;

    StartTick(): void;
    ProcessTick(): void;
    EndTick(): void;
}

declare interface CreepManager {

}