declare interface MemBase { }

/** Core OS */
declare interface KernelMemory extends MemBase {
    processTable: ProcessTable;
    processMemory: ProcessMemory;

    subscriptions: IDictionary<string, PID[]>;
    notifications: string[]
}
declare type ProcessMemory = {
    [id in PID]: MemBase;
}

declare interface ChildThreadState {
    priority: Priority;
    pid: PID;
    tid: ThreadID
}
declare interface ThreadMemory_Parent extends ThreadMemory {
    childThreads: { [tid in ThreadID]: ChildThreadState }
}
declare interface ThreadMemory extends MemBase {
    PKG: ScreepsPackage;
    pri: Priority;
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