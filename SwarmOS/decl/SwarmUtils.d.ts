declare const require: (module: string) => any;
declare var global: Dictionary

declare type IDictionary<T extends string, U> = { [id in T]: U };
declare type EDictionary<T> = { [id: number]: T };
declare type SDictionary<T> = IDictionary<string, T> | EDictionary<T>
declare type Dictionary = SDictionary<any>

declare type ObjectID = string;
declare type CreepID = ObjectID;
declare type StructureID = ObjectID;
declare type FlagID = ObjectID;
declare type SpawnID = ObjectID;
declare type RoomID = string;

declare type PlayerID = string;
declare type PID = string;
declare type ThreadID = string;
declare type GroupID = string;
declare type TempAgencyID = string;
declare type ScreepsPackage = OSPackage | CreepGroupPackage

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
declare function GetRandomID<T>(dictionaryObject: SDictionary<T>): T | undefined;