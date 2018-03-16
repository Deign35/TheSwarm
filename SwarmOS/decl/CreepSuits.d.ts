declare interface ICreepSuit<T extends CreepSuitTypes> {
    CreepSuitType: T;
    PrepSuit(): boolean;
    ActivateSuit(): void;
    FinalizeSuitData(): void;
}

declare type THarvester = ICreepSuit<CreepSuitTypes.SourceHarvester> & {

}