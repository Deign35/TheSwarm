declare const require: (module: string) => any;
declare type Dictionary = { [id: string]: any };
declare var global: Dictionary;

declare type CallbackFunction = (...args: any[]) => any;
declare interface IDelegate<T extends CallbackFunction> {
    Subscribe(id: string, callback: T): void;
    Unsubscribe(id: string): void;
    Notify(...args: any[]): void;
}
declare interface IDisposable {
    dispose(): void;
}
declare var DisposeAll: {
    subscribe(id: string, disposableObject: IDisposable): any,
    unsubscribe(id: string): any,
    DisposeAll(): any
}
declare type DisposableCallback<T extends IDisposable> = (disposableObject: T) => void;
declare function using<T extends IDisposable>(disposableObject: T, disposableAction: DisposableCallback<T>): void;

declare type MemoryFunc = (commandID: string) => any;
declare interface IMemory {
    readonly MemoryID: string;
    GetData(id: string): any;
    SetData(id: string, data: any): void;
    Save(): void;
    Load(): void;
}
declare class SwarmMemory implements IMemory {
    readonly MemoryID: string;
    Parent?: SwarmMemory;
    GetData(id: string): any;
    SetData(id: string, data: any): void;
    Save(): void;
    Load(): void;
}

declare class SwarmOverlord {
    static SaveData(id: string, dataObj: any): void;
    static LoadData(id: string): any;
    static SaveSwarmOverlordData(): void;
    static InitOverlord(): void;
}
declare class Swarmlord {
    static SaveData(data: IMemory): void;
    static LoadData(name: string): IMemory;
    static InitSwarmlord(): void;

}

declare type CommandFunc = (...args: any[]) => SwarmReturnCode;
declare interface ICommand {
    CommandLoop: CommandFunc;
    Execute(...inArgs: any[]): SwarmReturnCode;
}

declare class BasicCreepCommand extends SwarmMemory {
    CommandArgs: { [id: string]: string | number };
    Save(): void;
    Load(): void;
    Execute(): void;
    AssignCreep(creep: Creep): void;
    static ExecuteCreepCommand(commandType: CommandType, ling: Creep, args: { [name: string]: any }): SwarmReturnCode;
}

declare interface ICommandWeb extends SwarmMemory  {
    SetCommands(linksList: { [commandID: string]: CommandType }, defaultCommand: string): void;
    SetCommandComplete(fromID: string, results: SwarmReturnCode[]): void;
    SetCommandResponse(fromID: string, toID: string, results: SwarmReturnCode[]): void;
    SetDefaultCommandResponse(toID: string, results: SwarmReturnCode[]): void;
    SetForceEnd(results: SwarmReturnCode[]): void;
    GetCommandResult(fromID: string, result: SwarmReturnCode): string;
    GetCommandType(commandID: string): CommandType;
}
declare interface IJob extends IMemory {
    JobCommands: ICommandWeb;
}