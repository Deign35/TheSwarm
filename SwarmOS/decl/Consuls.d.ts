declare interface IConsul extends IMemory {
    consulType: string;
    ActivateConsul(): void;
    ValidateConsulState(): void;
    Queen: INestQueen;
}
declare interface ICreepConsul extends IConsul {
    AssignCreep(creepName: string, jobId: string): void;
    ReleaseCreep(creepName: string): void;
    UpdateJob(jobId: string): void;
    InitJobRequirements(): void;
}

declare type CreepConsul_Data = {
    creepName: string;
    jobId: string;
    fetching: boolean;
    targetID?: string;
    respawnedCreep?: string;
}

declare type HarvestConsul_SourceData = {
    sourceID: string;
    containerID?: string;
    constructionSite?: string;
}

declare type SpawnConsul_SpawnArgs = {
    body: BodyPartConstant[];
    targetTime: number;
    creepName: string;
    requestorID: string;
    targetPos?: RoomPositionData;
    calculatedCost?: number;
}

declare type ConstructionRequest = {
    siteId: string;
    requestor: string;
}

declare type ConstructorData = CreepConsul_Data & {
    target: string;
    fetching: boolean;
}

declare type RefillTarget = StructureSpawn | StructureExtension | StructureTower | StructureLink | Creep; // For now...

declare type DistributionConsul_RefillerData = CreepConsul_Data & {
    refillList: string[];
    curTarget: number;
    fetching: boolean;
    idleTime: number;
}

declare type DistributionConsul_DeliveryRequest = {
    id: string;
    amount: number;
    time: number;
    resourceType?: ResourceConstant;
}
declare type DelivererData = CreepConsul_Data & {
    refillList: DistributionConsul_DeliveryRequest[];
    fetching: boolean;
    target: string;
}
