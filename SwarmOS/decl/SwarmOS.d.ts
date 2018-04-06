declare type IDictionary<T> = { [id: string]: T };
declare type Dictionary = IDictionary<any>
declare interface ProfilerMemory {
    data: { [name: string]: ProfilerData };
    start?: number;
    total: number;
}

interface ProfilerData {
    calls: number;
    time: number;
}

interface Profiler {
    clear(): void;
    output(): void;
    start(): void;
    status(): void;
    stop(): void;
    toString(): string;
}

declare type SwarmStructureType = SwarmType.SwarmContainer | SwarmType.SwarmController | SwarmType.SwarmExtension |
    SwarmType.SwarmExtractor | SwarmType.SwarmKeepersLair | SwarmType.SwarmLab | SwarmType.SwarmLink |
    SwarmType.SwarmNuker | SwarmType.SwarmObserver | SwarmType.SwarmPortal | SwarmType.SwarmPowerBank |
    SwarmType.SwarmPowerSpawn | SwarmType.SwarmRampart | SwarmType.SwarmRoad | SwarmType.SwarmSpawn |
    SwarmType.SwarmStorage | SwarmType.SwarmTerminal | SwarmType.SwarmTower | SwarmType.SwarmWall

declare type SwarmRoomObjectType = SwarmType.SwarmSite | SwarmType.SwarmMineral | SwarmType.SwarmNuke |
    SwarmType.SwarmResource | SwarmType.SwarmSource | SwarmType.SwarmTombstone

declare type OwnableStructureConstant = STRUCTURE_CONTROLLER | STRUCTURE_EXTENSION | STRUCTURE_EXTRACTOR |
    STRUCTURE_KEEPER_LAIR | STRUCTURE_LAB | STRUCTURE_LINK | STRUCTURE_NUKER | STRUCTURE_OBSERVER | STRUCTURE_POWER_BANK |
    STRUCTURE_POWER_SPAWN | STRUCTURE_RAMPART | STRUCTURE_SPAWN | STRUCTURE_STORAGE | STRUCTURE_TERMINAL | STRUCTURE_TOWER
declare type SwarmOwnableStructureType = SwarmType.SwarmController | SwarmType.SwarmExtension | SwarmType.SwarmExtractor |
    SwarmType.SwarmKeepersLair | SwarmType.SwarmLab | SwarmType.SwarmLink | SwarmType.SwarmNuker | SwarmType.SwarmObserver |
    SwarmType.SwarmPowerBank | SwarmType.SwarmPowerSpawn | SwarmType.SwarmRampart | SwarmType.SwarmSpawn |
    SwarmType.SwarmStorage | SwarmType.SwarmTerminal | SwarmType.SwarmTower

declare interface ISwarmlord {
    ValidateMemory(): void;
    SaveMasterMemory<T extends any>(memObject: T, save: boolean): void;
    CheckoutMasterMemory(dataType: string): any;
} declare var Swarmlord: ISwarmlord;

declare var SwarmCreator: {
    CreateConsulMemory(mem: TConsulData): any;
    CreateConsulObject(consulType: ConsulType): any;
    CreateSwarmMemory(mem: IData<SwarmDataType>): any;
    CreateSwarmObject(swarmType: SwarmType, subType?: string | number): any;
    CreateNewSwarmMemory(id: string, swarmType: SwarmType): any;
    GetStructureSwarmType(structure: Structure): SwarmStructureType;
    GetSwarmType(obj: any): SwarmType;
    CreateNewSwarmObject<T extends any>(obj: Room | RoomObject): T;
    GetObjSaveID(obj: Room | RoomObject): string;

}