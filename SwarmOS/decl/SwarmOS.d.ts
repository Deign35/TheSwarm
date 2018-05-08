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
declare function posisInterface(interfaceId: string): (target: any, propertyKey: string) => any