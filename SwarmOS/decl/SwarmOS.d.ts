declare const require: (module: string) => any;
declare type IDictionary<T> = { [id: string]: T };
declare type Dictionary = IDictionary<any>
declare var global: Dictionary & {
    CreepCounter: number
}
declare var CreepCounter: number;

declare type CallbackFunction = (...args: any[]) => any;
declare interface IDelegate<T extends CallbackFunction> {
    Subscribe(id: string, callback: T): void;
    Unsubscribe(id: string): void;
    Notify(...args: any[]): void;
}

declare interface IMemory {
    readonly id: string;
    Save(): void;
    Load(): void;
    GetData(id: string): any;
    SetData(id: string, data: any): void;
    RemoveData(id: string): any;
}

declare type DisposableCallback<T extends IDisposable> = (disposableObject: T) => void;
declare function using<T extends IDisposable>(disposableObject: T, disposableAction: DisposableCallback<T>): void;
declare function DisposeAll(): void;
declare interface IDisposable {
    dispose(): void;
}

declare type RoomPositionData = {
    x: number,
    y: number
}
declare type RoomObjectWithID = RoomPositionData & {
    id: string
}

declare interface IImperator {
    ActivateCreep(creep: Creep): void;
}
declare interface IConsul {
    SetTarget(target: number): void;
    NeedsCapacityIncreased: boolean;
}
declare interface CreepManager {

}
declare interface IQueen {
    Council: IDictionary<IConsul>;
    creepController: CreepManager;
    ReceiveCommand(): never;
}

declare interface SwarmQueen {

}