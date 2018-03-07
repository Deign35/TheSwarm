declare interface IConsul extends IMemory {
    consulType: string;
    ActivateConsul(): void;
    ValidateConsul(): void;
    Queen: INestQueen;
}
declare interface ICreepConsul extends IConsul {
    AssignCreep(creepName: string, jobId: string): void;
    ReleaseCreep(creepName: string): void;
}

declare type CreepConsul_Data = {
    creepName: string;
    active: boolean;
    targetID?: string;
}
declare type DistributionConsul_CreepData = CreepConsul_Data & {
    prime?: boolean;
}
declare type CollectorConsul_CreepData = CreepConsul_Data & {
    harvestPosition: RoomPosition;
    constructionSite?: string;
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
    // priority!  Expand NestJobs to handle requests more generally?
}

declare type ConstructorData = CreepConsul_Data & {
    target: string;
    fetching: boolean;
}

declare type EnergyStructure = StructureSpawn | StructureExtension | StructureTower | StructureLink;
declare type RefillTarget = EnergyStructure | Creep; // For now...

declare type DistributionConsul_DeliveryRequest = {
    id: string;
    amount: number;
    time: number;
    resourceType?: ResourceConstant;
}