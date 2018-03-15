declare interface ICreepSuit<T> {
    new(creep: TSwarmCreep): ICreepSuit<T>
    CreepSuitType: T;
}
