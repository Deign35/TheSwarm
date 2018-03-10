declare interface IImperator {
    ActivateCreep(creep: Creep): void;
}
declare interface IConsul {
    SetTarget(target: number): void;
    NeedsCapacityIncreased: boolean;
}
declare interface CreepManager {

}
declare interface IQueen extends IMemory {
    Council: IDictionary<IConsul>;
    creepController: CreepManager;
    ReceiveCommand(): never;
}

declare interface SwarmQueen {

}