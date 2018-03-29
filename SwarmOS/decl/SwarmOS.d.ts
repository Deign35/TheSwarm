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

declare type SwarmRoomObjectType = SwarmType.SwarmSite | SwarmType.SwarmCreep | SwarmType.SwarmFlag |
    SwarmType.SwarmMineral | SwarmType.SwarmNuke | SwarmType.SwarmResource |
    SwarmType.SwarmTombstone | SwarmStructureType

declare type OwnableStructureConstant = STRUCTURE_CONTROLLER | STRUCTURE_EXTENSION | STRUCTURE_EXTRACTOR |
    STRUCTURE_KEEPER_LAIR | STRUCTURE_LAB | STRUCTURE_LINK | STRUCTURE_NUKER | STRUCTURE_OBSERVER | STRUCTURE_POWER_BANK |
    STRUCTURE_POWER_SPAWN | STRUCTURE_RAMPART | STRUCTURE_SPAWN | STRUCTURE_STORAGE | STRUCTURE_TERMINAL | STRUCTURE_TOWER

declare var TheSwarm: {
    creeps: { [id: string]: ISwarmCreep },
    flags: { [id: string]: ISwarmFlag },
    rooms: { [id: string]: ISwarmRoom },
    // roomObjects: { [id: string]: TSwarmRoomObject },
    structures: { [id: string]: TSwarmStructure }
}