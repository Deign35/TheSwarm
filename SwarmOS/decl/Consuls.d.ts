declare interface IConsul extends IMemory {
    consulType: string;
}
declare type CreepConsul_Data = {
    creepName: string;
}
declare type SpawnConsul_SpawnData = RoomObjectWithID & {
}

declare type SpawnConsul_SpawnArgs = {
    body: BodyPartConstant[],
    targetTime: number,
    creepName: string,
    requestorID: string,
    targetPos?: RoomPositionData,
    calculatedCost?: number,
}

declare type SpawnConsul_RequirementsData = {
    energyNeeded: number,
    neededBy: number,
}
declare type HarvestConsul_SourceData = RoomObjectWithID & {
    spawnBuffer: number,
    lastEnergy: number,
    creepName: string,
    containerID?: string,
    constructionSite?: string,
}

declare type CreepConsul_BaseData = {
    creepName: string,
    fetching: boolean,
    targetID?: string,
}

declare type ConstructionRequest = {
    siteId: string,
    requestor: string,
}

declare type ConstructorData = CreepConsul_Data & {
    target: string,
    fetching: boolean
}

declare type ControllerConsul_CreepData = CreepConsul_Data & {
    controllerTarget: string,
    fetching: boolean,
}
declare type SpawnRefillTarget = StructureSpawn | StructureExtension | StructureTower; // For now...

declare type DistributionConsul_RefillerData = CreepConsul_Data & {
    refillList: string[],
    curTarget: number,
    fetching: boolean,
    idleTime: number,
}