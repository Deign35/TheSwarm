declare interface MemBase {
    OLD?: string; // Denoting that a bit of memory is running on old code or other VERSIONING stuffs.
}

/** Core OS */
declare interface KernelMemory extends MemBase {
    processTable: ProcessTable;
    processMemory: ProcessMemory;

    ErrorLog: string[];
}
declare type ProcessMemory = {
    [id in PID]: MemBase;
}

declare interface ChildThreadState {
    priority: Priority;
    pid: PID;
    tid: ThreadID
}
declare interface PackageProviderMemory extends MemBase {
    services: {
        [id: string]: {
            pid: PID,
            serviceID: string
        }
    }
}

declare interface SwarmCLIMemory extends MemBase {
    commands: any[]
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