declare const require: (module: string) => any;
declare var global: { [id: string]: any };

declare function CopyObject<T>(obj: T): T;
declare class Stopwatch {
    Start(): void;
    Stop(): void;
    Reset(): void;
    Lap(): void;
    ToString(): string;
}

declare var SwarmLogger: {
    Log(message: string, level?: LogLevel): void;
    LogWarning(message: string): void;
    LogError(message: string): void;
}