declare interface IConsul extends IMemory {
    consulType: string;
    ScanRoom(roomName: string): void;
    DetermineRequirements(): void;
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
    harvester?: string,
    containerID?: string,
    constructionSite?: string,
    droppedResourcePile?: RoomPositionData,
    temporaryWorkers?: string[],
}
declare type HarvestConsul_RequirementsData = {
    creeps: Requirement_CreepDefinition;
}

declare type Requirement_CreepDefinition = {
    Body: BodyPartConstant[];
}