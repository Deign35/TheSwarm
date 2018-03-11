declare interface IImperator {
    ActivateCreep(creep: Creep): void;
}
declare interface IConsul {
    SetTarget(target: number): void;
    NeedsCapacityIncreased: boolean;
}
declare interface CreepManager {

}
declare interface IQueen {
    Council: IDictionary<IConsul>;
    creepController: CreepManager;
    ReceiveCommand(): never;
}

declare interface SwarmQueen {

}
