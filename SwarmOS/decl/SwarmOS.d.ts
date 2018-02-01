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
    GetData(id: string): any;
    SetData(id: string, data: any): void;
}
declare class SwarmOverlord {
    static SaveData(id: string, dataObj: IMemory): void;
    static LoadData(id: string): IMemory;
}

declare type CommandFunc = (...args: any[]) => SwarmReturnCode;
declare interface ICommand {
    CommandLoop: CommandFunc;
    CommandType: CommandType;
    Execute(...inArgs: any[]): SwarmReturnCode;
}
/*
declare interface CreepCommand extends ICommand {
    Execute(creep: Creep, ...inArgs: any[]): SwarmReturnCode;
    CreepReactionToCommandCompletion(commandResult: ScreepsReturnCode): SwarmReturnCode
    ConstructCommandArgs(...args: any[]): { [name: string]: any };
}
declare interface ICreepCommand<T extends BasicCreepCommandType> extends ICommand, CommandBase<T> {
    ExecuteCreep(creep: Creep): ScreepsReturnCode;
}
declare interface CommandBase<CommandType> extends IMemory, ICommand {

}
declare class Swarmling extends Creep {

    /*Attack(): ScreepsReturnCode;
    Build(): ScreepsReturnCode;
    Dismantle(): ScreepsReturnCode;
    Drop(): ScreepsReturnCode;
    Harvest(): ScreepsReturnCode;
    Heal(): ScreepsReturnCode;
    Move(): ScreepsReturnCode;
    Pickup(): ScreepsReturnCode;
    RangedAttack(): ScreepsReturnCode;
    RangedHeal(): ScreepsReturnCode;
    Repair(): ScreepsReturnCode;
    Say(): ScreepsReturnCode;
    Suicide(): ScreepsReturnCode;
    Transfer(): ScreepsReturnCode;
    UpgradeController(): ScreepsReturnCode;
    Withdraw(): ScreepsReturnCode;
}*/