declare const require: (module: string) => any;
declare var global: { [id: string]: any };

declare class Stopwatch {
    Start(): void;
    Stop(): void;
    Reset(): void;
    Lap(): void;
    ToString(): string;
}

declare interface LogContext {
    logID: string,
    logLevel: number,
}
/*declare class SwarmLogger {*/
declare const LOG_ALERT = 6;
declare const LOG_FATAL = 5;
declare const LOG_ERROR = 4;
declare const LOG_WARN = 3;
declare const LOG_INFO = 2;
declare const LOG_DEBUG = 1;
declare const LOG_TRACE = 0;
declare interface ILogger {
    trace(message: (string | (() => string)), contextID?: string): void;
    debug(message: (string | (() => string)), contextID?: string): void;
    info(message: (string | (() => string)), contextID?: string): void;
    warn(message: (string | (() => string)), contextID?: string): void;
    error(message: (string | (() => string)), contextID?: string): void;
    fatal(message: (string | (() => string)), contextID?: string): void;
    alert(message: (string | (() => string)), contextID?: string): void;

    CreateLogContext(context: LogContext): void;
    OutputLog(): void;
}
declare var Logger: ILogger;


declare function CopyObject<T>(obj: T): T;
declare function GetSpawnCost(body: BodyPartConstant[]): number;
declare function ConstructBodyArray(bodyPartsList: [BodyPartConstant, number][]): BodyPartConstant[];
declare function DoTest(testID: string, memObject: any, testFunction: () => void,
    workingVersion?: (exc: Error) => void): void
declare function GetSUID(): string;
declare function GetRandomIndex(list: any[]): number;
declare function GetRandomID<T>(dictionaryObject: IDictionary<T>): T | undefined;
declare function ForEach<T>(collection: IDictionary<T>, action: (val: T, index: number) => void): void