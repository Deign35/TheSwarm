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
declare type SpawnRequestID = string;

declare type ScreepsPackage = OSPackage | SlimOSPackage | CreepRoles

declare type ObjectTypeWithID = Structure | Creep | Source | ConstructionSite | Mineral | Nuke | Resource | Tombstone;
declare type EnergyStructureType = StructureExtension | StructureSpawn | StructureContainer | StructureStorage | StructureLink | StructureTerminal;
declare type TransferTargetType = EnergyStructureType | Creep;

declare type MapArray = number[];
declare type MapLayers = string | EZMapLayer
declare interface ObjectIDWithPos {
    x: number;
    y: number;
    id: ObjectID;
}

declare interface Profiler {
    clear(): void;
    output(): void;
    start(): void;
    status(): void;
    stop(): void;
    toString(): string;
}
declare function extensionInterface(interfaceId: string): (target: any, propertyKey: string) => any
declare function extensionExposure(interfaceId: string): (target: any, propertyKey: string) => any

declare class Stopwatch {
    Start(): void;
    Stop(): void;
    Reset(): void;
    Lap(): void;
    ToString(): string;
}

declare var DistMap: {
    CreateDistanceMap(room: Room, targetPositions: RoomPosition[], maxDistance?: number): number[];
    AddDistanceMaps(maps: number[][]): number[];
    AverageDistanceMaps(maps: number[][]): number[];
    MultiplyDistanceMaps(maps: number[][]): number[];
    MaxDistanceMaps(maps: number[][]): number[];
    MinDistanceMaps(maps: number[][]): number[];
    ConvertXYToIndex(x: number, y: number): number;
    ConvertIndexToXY(index: number): { x: number, y: number };
    AddToMap(addVal: number, map: MapArray): void;
    MultiplyMap(mulitplyVal: number, map: MapArray): void;
}
declare const ROOM_HEIGHT = 50;
declare const ROOM_WIDTH = 50;
declare const ROOM_ARRAY_SIZE = 2500;

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


declare interface IStatistics {
    addSimpleStat(name: string, value?: any): void;
    commit(): void;
    addStat(name: string, tags?: { [id: string]: any }, values?: { [id: string]: any }): void;
    reset(): void
}

declare var GStats: IStatistics;

// SwarmCLI

//declare function CLI(command: CLI_Command, ...args: any[]): ScreepsReturnCode;
declare function CLI(command: CLI_Assimilate, roomID: RoomID, roomType: RoomType, homeRoom?: RoomID): ScreepsReturnCode;

declare function CLI(command: CLI_Launch, pkg: ScreepsPackage, startMem: MemBase): ScreepsReturnCode;
declare function CLI(command: CLI_ChangeFlag, priA: ColorConstant, priB: ColorConstant, secA?: ColorConstant, secB?: ColorConstant): ScreepsReturnCode;
declare function CLI(command: CLI_Spawn, roomID: RoomID, jobType: CreepRoles, num?: number, mem?: MemBase): ScreepsReturnCode;