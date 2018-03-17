declare interface ICreepSuit<T extends CreepSuitType> {
    CreepSuitType: T;
    PrepSuit(): boolean;
    ActivateSuit(): void;
    FinalizeSuitData(): void;
}

declare type THarvester = ICreepSuit<CreepSuitType.SourceHarvester> & {

}

declare interface ICreepSuit2<T extends CreepSuitType> {
    CreepSuitType: T;
    // Creating the suit sets it up to be used.
    AssignCreepToSuit(creep: TSwarmCreep): void;
    OperateSuit(): void;
}

declare interface INeuralNetwork {
    AddNewJob(job: IJobDefinition): void;
    GetNewJob(creep: TSwarmCreep): IJobDefinition;
}