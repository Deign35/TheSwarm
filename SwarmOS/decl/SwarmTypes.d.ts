declare type IDictionary<T> = { [id: string]: T };
declare type Dictionary = IDictionary<any>
interface Memory {
    profiler: ProfilerMemory;
}
interface ProfilerMemory {
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