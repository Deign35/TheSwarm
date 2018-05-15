declare const require: (module: string) => any;
declare var global: { [id: string]: any }
declare interface SDictionary<T> { [id: string]: T }
declare interface EDictionary<T> { [id: number]: T }
declare type IDictionary<T> = EDictionary<T> | SDictionary<T>;
declare type Dictionary = IDictionary<any>;

declare interface Profiler {
    clear(): void;
    output(): void;
    start(): void;
    status(): void;
    stop(): void;
    toString(): string;
}
declare function extensionInterface(interfaceId: string): (target: any, propertyKey: string) => any

declare class Stopwatch {
    Start(): void;
    Stop(): void;
    Reset(): void;
    Lap(): void;
    ToString(): string;
}

declare interface LogContext {
    logID: string,
    logLevel?: LogLevel,
    counter?: boolean // (TODO) Implement labeling logs by a log counter
}
/*declare class SwarmLogger {*/
declare interface ILogger {
    trace(message: (string | (() => string))): void;
    debug(message: (string | (() => string))): void;
    info(message: (string | (() => string))): void;
    warn(message: (string | (() => string))): void;
    error(message: (string | (() => string))): void;
    fatal(message: (string | (() => string))): void;
    alert(message: (string | (() => string))): void;
}


declare function CopyObject<T>(obj: T): T;
declare function GetSpawnCost(body: BodyPartConstant[]): number;
declare function ConstructBodyArray(bodyPartsList: [BodyPartConstant, number][]): BodyPartConstant[];
declare function DoTest(testID: string, memObject: any, testFunction: () => void,
    workingVersion?: (exc: Error) => void): void
declare function GetSUID(): string;
declare function GetRandomIndex(list: any[]): number;
declare function GetRandomID<T>(dictionaryObject: IDictionary<T>): T | undefined;
declare function ForEach<T>(collection: IDictionary<T>, action: (val: T, index: number) => void): void

declare interface CreepBody {
    m: number,
    c?: number,
    a?: number,
    r?: number,
    cl?: number,
    w?: number,
    h?: number,
    t?: number

    cost: number,
}
declare var CreepBodies: {
    [id: string]: CreepBody[]
}