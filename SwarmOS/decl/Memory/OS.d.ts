declare interface MemBase { }

/** Core OS */
declare interface KernelMemory extends MemBase {
    processTable: ProcessTable;
    processMemory: ProcessMemory;
    threadTable: ThreadTable;

    subscriptions: IDictionary<string, PID[]>;
    notifications: string[]
}
declare type ThreadTable = {
    [id in ThreadID]: PID;
}
declare type ProcessMemory = {
    [id in PID]: MemBase;
}

declare interface ThreadMemory_Parent extends ThreadMemory {
    childThreads: {
        [tid in ThreadID]: {
            priority: Priority,
            pid: PID
            tid: tid
        }
    }
}
declare interface ThreadMemory extends MemBase {
    PKG: ScreepsPackage;
    pri: Priority;
    sta: ThreadState;
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