declare const require: (module: string) => any;
declare var global: { [name: string]: any };

declare type CallbackFunction = (...args: any[]) => any;
declare interface IDelegate<T extends CallbackFunction> {
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
    readonly id: string;
    Save(lock: boolean): void;
    Load(): void;
}
declare class SwarmOverlord {
    static SaveData(id: string, dataObj: IMemory): void;
    static LoadData(id: string): IMemory;
}

declare type CommandFunc = (...args: any[]) => ScreepsReturnCode;
declare interface ICommand {
    Execute(): ScreepsReturnCode;
    CommandLoop: CommandFunc;
}
declare interface ICreepCommand<T extends BasicCreepCommandType> extends ICommand, CommandBase<T> {
    ExecuteCreep(creep: Creep): ScreepsReturnCode;
}
declare interface CommandBase<CommandType> extends IMemory, ICommand {

}