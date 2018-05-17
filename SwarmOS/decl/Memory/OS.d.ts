declare interface MemBase { }

/** Core OS */
declare interface KernelMemory extends MemBase {
    processTable: ProcessTable;
    processMemory: ProcessMemory;
    subscriptions: SDictionary<PID[]>;
    notifications: string[]
}

declare interface ScheduledProcessMemBase extends MemBase {
    sID: string
}


declare interface PackageProviderMemory extends MemBase {
    services: {
        [id: string]: {
            pid: PID,
            serviceID: string
        }
    }
}
/** Stats */
declare type RoomStats = {}
declare type MarketStats = {}
declare type CollectionStats = {}
declare type StatsMemoryStructure = {
    rooms: { [id: string]: RoomStats }
    market: MarketStats
    totalGCL: number
}
declare interface ProfilerMemory {
    data: { [name: string]: ProfilerData };
    start?: number;
    total: number;
}

interface ProfilerData {
    calls: number;
    time: number;
}