declare interface IModule {

}

declare interface SwarmModule extends IModule {

}

declare interface CreepModule extends SwarmModule {

}

declare interface SourceHarvesterModule extends CreepModule {
    sourceID: string;
    path: any[];
}

declare interface HarvestModule {
    sourceID: string;
    bodyDefinition: [
        [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE],
        [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],
        [WORK, WORK, WORK, WORK, WORK, MOVE],
        [WORK, WORK, CARRY, MOVE]
    ]
}