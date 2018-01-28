declare const require: (module: string) => any;
declare var global: { [name: string]: any };

declare type CallbackFunction = (...args: any[]) => void;
declare interface Delegate<T extends CallbackFunction> {
    Subscribe(id: string, callback: T): void;
    Unsubscribe(id: string): void;
    Notify(...args: any[]): void;
}

declare interface IDisposable {
    dispose(): void;
}
declare type DisposableCallback<T extends IDisposable> = (disposableObject: T) => void;
declare function using<T extends IDisposable>(disposableObject: T, disposableAction: DisposableCallback<T>): void;

declare interface IMemory extends IDisposable {
    readonly MemoryId: string;
    Save(lock: boolean): void;
    Load(): void;
}
declare class SwarmOverlord {
    static SaveData(dataObj: IMemory): void;
    static LoadData(id: string): IMemory;
}