declare interface MemBase {
    CV?: string; // Default (C)allback (V)alue to the HC.
    HC?: string; // (H)andle of the (C)allback function for informing the parent process that this process has died.
}

/** Core OS */
declare interface KernelMemory extends MemBase {
    processTable: ProcessTable;
    processMemory: IDictionary<PID, string>

    ErrorLog: string[];
}
declare type ProcessMemory = {
    [id in PID]: MemBase;
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