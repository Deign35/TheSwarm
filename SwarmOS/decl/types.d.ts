declare const require: (module: string) => any;
declare var global: {[name: string]: any};

declare type CallbackFunction = (...args: any[]) => void;
declare class IDisposable {
    dispose(): void;
}

declare type DisposeDelegate<T> = (disposableObject: T) => void;
declare function using<T extends IDisposable>(disposableObject: T, disposableAction: DisposeDelegate<T>): void;
declare class IMemory {
    readonly MemoryId: string;
    Save(): void;
    Load(): void;
}
declare class SwarmOverlord {
    static SaveData(dataObj: IMemory): void;
}