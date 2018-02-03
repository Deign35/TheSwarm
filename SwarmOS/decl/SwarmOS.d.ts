declare const require: (module: string) => any;
declare type Dictionary = { [id: string]: any };
declare var global: Dictionary;

declare type CallbackFunction = (...args: any[]) => any;
declare interface IDelegate<T extends CallbackFunction> {
    Subscribe(id: string, callback: T): void;
    Unsubscribe(id: string): void;
    Notify(...args: any[]): void;
}
declare interface IMemory {
    readonly MemoryID: string;
    GetData(id: string): any;
    SetData(id: string, data: any): void;
    Save(): void;
    Load(): void;
}
declare interface IJob extends IMemory {
    JobCommands: ICommandWeb;
    JobArgs: IMemory;
    ProcessJob(JobMemory: IMemory): number;
}
declare interface ICommandWeb extends IMemory {
    SetCommands(linksList: { [commandID: string]: string }, defaultCommand: string): void;
    SetCommandComplete(fromID: string, results: number[]): void;
    SetCommandResponse(fromID: string, toID: string, results: number[]): void;
    SetDefaultCommandResponse(toID: string, results: number[]): void;
    SetForceEnd(results: number[]): void;
    GetCommandResult(fromID: string, result: number): string;
    GetCommandType(commandID: string): string;
}

declare var Swarmlord: {
    GetData(name: string): IMemory,
    SetData(data: IMemory): void,
    SaveSwarmlord(): void,
    InitSwarmlord(): void,
}
/*



declare class SwarmMemory implements IMemory {
    constructor(id: string, parent?: SwarmMemory);
    readonly MemoryID: string;
    Parent?: SwarmMemory;
    GetData(id: string): any;
    SetData(id: string, data: any): void;
    Save(): void;
    Load(): void;
}
declare class Swarmlord extends SwarmMemory {
    static SetData(data: IMemory): void;
    static GetData(name: string): IMemory;
    static SaveSwarmlord(): void;
    static InitSwarmlord(): void;
}

declare class BasicCreepCommand extends SwarmMemory {
    CommandArgs: { [id: string]: string | number };
    Execute(): void;
    AssignCreep(creep: Creep): void;
    static ExecuteCreepCommand(commandType: CommandType, ling: Creep, args: { [name: string]: any }): SwarmReturnCode;
}

declare interface ICommandWeb extends SwarmMemory {
    SetCommands(linksList: { [commandID: string]: CommandType }, defaultCommand: string): void;
    SetCommandComplete(fromID: string, results: SwarmReturnCode[]): void;
    SetCommandResponse(fromID: string, toID: string, results: SwarmReturnCode[]): void;
    SetDefaultCommandResponse(toID: string, results: SwarmReturnCode[]): void;
    SetForceEnd(results: SwarmReturnCode[]): void;
    GetCommandResult(fromID: string, result: SwarmReturnCode): string;
    GetCommandType(commandID: string): CommandType;
}*/