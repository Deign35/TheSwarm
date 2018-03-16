declare interface ICreepSuit<T extends CreepSuitTypes> {
    CreepSuitType: T;
    PrepSuit(): boolean;
    ActivateSuit(): void;
    FinalizeSuitData(): void;
}

declare type THarvester = ICreepSuit<CreepSuitTypes.SourceHarvester> & {

}

declare interface ICreepSuit2<T extends CreepSuitTypes> {
    CreepSuitType: T;
    // Creating the suit sets it up to be used.
    AssignCreepToSuit(creep: TSwarmCreep): void;
    OperateSuit(): void;
}

declare interface IJobManager {

}