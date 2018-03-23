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