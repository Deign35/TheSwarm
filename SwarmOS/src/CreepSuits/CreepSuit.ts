export abstract class CreepSuit<T extends CreepSuitType> implements ICreepSuit<T> {
    constructor(creep: TSwarmCreep) {
        this.creep = creep;
    }
    protected creep: TSwarmCreep;
    abstract get CreepSuitType(): T;
    abstract PrepSuit(): boolean;
    abstract ActivateSuit(): void;
    abstract FinalizeSuitData(): void;
}