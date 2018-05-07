declare const require: (module: string) => any;
declare var global: { [id: string]: any };

declare class Stopwatch {
    Start(): void;
    Stop(): void;
    Reset(): void;
    Lap(): void;
    ToString(): string;
}
declare class SwarmLogger {
    trace(message: (string | (() => string))): void;
    debug(message: (string | (() => string))): void;
    info(message: (string | (() => string))): void;
    warn(message: (string | (() => string))): void;
    error(message: (string | (() => string))): void;
    fatal(message: (string | (() => string))): void;
    alert(message: (string | (() => string))): void;
}
declare var Logger: SwarmLogger;


declare function CopyObject<T>(obj: T): T;
declare function GetSpawnCost(body: BodyPartConstant[]): number;
declare function ConstructBodyArray(bodyPartsList: [BodyPartConstant, number][]): BodyPartConstant[];
declare function DoTest(testID: string, memObject: any, testFunction: () => void,
    workingVersion?: (exc: Error) => void): void
declare function GetSUID(): string;
declare function RecycleSUID(suid: string): void;
declare function GetRandomIndex(list: any[]): number;
declare function GetRandomID<T>(dictionaryObject: IDictionary<T>): T | undefined;
declare function ForEach<T>(collection: IDictionary<T>, action: (val: T, index: number) => void): void