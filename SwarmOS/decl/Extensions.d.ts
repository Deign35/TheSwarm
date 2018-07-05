/**
 * Package extensions are accessible functionality that can be accessed regardless of whether the host process is running.
 * These will access memory and adjust relevant entries.  The managers will run and operate on that data when operational.
 * 
 * Add new package extensions to this page and add it to IPackageInterfaces
 */
declare interface IPackageExtension { }

/**
 * Package extensions can be accessed from any process via the ExtensionRegistry.
 */
declare interface IPackageInterfaces {
    [index: string]: IPackageExtension | undefined;
    [EXT_Registry]: IExtensionRegistry;
    [EXT_Kernel]: IKernelExtensions;
    [EXT_Logger]: IKernelLoggerExtensions;
}

/**
 * A process can access the registry via this function.
 */
declare interface IProcessContext {
    extensionRegistry: IExtensionRegistry;
    //getExtensionInterface<T extends keyof IPackageInterfaces>(interfaceId: T): IPackageInterfaces[T];
}

/**
 * A registry of all the extensions that have been registered with the system (itself).
 */
declare interface IExtensionRegistry extends IPackageExtension {
    get(interfaceId: string): IPackageExtension | undefined;
    register(interfaceId: string, extension: IPackageExtension): boolean;
    unregister(interfaceId: string): boolean;
}

/**
 * Extensions for processes to interface with the OS kernel
 */
declare interface IKernelExtensions extends IPackageExtension {
    installPackages(packages: IPackage<MemBase>[]): void;
    startProcess(packageName: string, savePath: string, startMem: MemBase, opts?: {
        parentPID?: PID,
        desiredPID?: PID
    }): PID;
    killProcess(pid: PID | undefined, msg: string): void;
    getProcessByPID(pid: PID): IProcess | undefined;
    setParent(pid: PID, parentId?: PID): boolean;
    sleep(pid: PID, ticks: number): void;
    wake(pid: PID): void;
}

/**
 * A context is created with an ID and a minimum logging level.
 * When logging, use the logID to associate logs with eachother
 */
declare interface IKernelLoggerExtensions extends IPackageExtension, ILogger {
    trace(message: (string | (() => string)), logID?: string): void;
    debug(message: (string | (() => string)), logID?: string): void;
    info(message: (string | (() => string)), logID?: string): void;
    warn(message: (string | (() => string)), logID?: string): void;
    error(message: (string | (() => string)), logID?: string): void;
    fatal(message: (string | (() => string)), logID?: string): void;
    alert(message: (string | (() => string)), logID?: string): void;

    CreateLogContext(logID: string, logLevel?: LogLevel): ILogger;
    DumpLogToConsole(endTick?: boolean): void;
}

/**
 * Notifications can be used to wake a sleeping process or otherwise message across process.
 * Messages will queue up for the tick and will be sent on the following tick.
 */
declare interface IKernelNotificationsExtension extends IPackageExtension {
    Notify(id: string): void;
    Subscribe(id: string): void;
    UnSubscribe(id: string): void;
}

/**
 * Allows a process to be put to sleep or awoken
 */
declare interface IKernelSleepExtension extends IPackageExtension {
}

/**
 * Room data retrieves currently saved information for a given room.
 * Giving back constructionSites, structures, sources, and other information.
 * Is updated on a regular schedule by the RoomManager.
 *
declare interface IRoomDataExtension extends IPackageExtension {
    GetRoomData(roomID: string): RoomState | undefined;
    BootRoom(roomID: string, force: boolean): void;
}

/**
 * Extension for processes to be able to request creep spawning.
 *
declare interface ISpawnRegistryExtensions extends IPackageExtension {
    cancelRequest(id?: SpawnRequestID): boolean;
    getRequestStatus(id?: SpawnRequestID): SpawnState;
    requestSpawn(context: SpawnContext, location: RoomID, spawnPriority: number,
        maxSpawnDistance?: number, startMem?: ScreepsObject_CreepMemory): SpawnRequestID;
    getRequestContext(id?: SpawnRequestID): SpawnContext | undefined;
}*/

/**
 * Registry for creep management and ownership control
 *
declare interface ICreepRegistryExtensions extends IPackageExtension {
    tryFindCompatibleCreep(creepType: CT_ALL, level: number, targetRoom: RoomID, maxDistance?: number): string | undefined
    tryRegisterCreep(creepID: CreepID): boolean;
    tryGetCreep(id?: CreepID, requestingPID?: PID): Creep | undefined;
    tryReserveCreep(id?: CreepID, requestingPID?: PID, priority?: number): boolean;
    releaseCreep(id?: CreepID, requestingPID?: PID): void;
}

declare interface ICreepActivityExtensions extends IPackageExtension {
    CreateNewCreepActivity(actionMem: CreepActivity_Memory, parentPID: PID): PID | undefined;
    RunActivity(args: RunArgs): ScreepsReturnCode;
    ValidateActionTarget(actionType: ActionType, target: any): boolean;
    CreepIsInRange(actionType: ActionType, pos1: RoomPosition, pos2: RoomPosition): boolean;
    MoveCreep(creep: Creep, pos: RoomPosition, moveToOpts?: MoveToOpts): ScreepsReturnCode;
}

declare interface IMapDirectory extends IPackageExtension {
    CreateMapForRoom(roomID: RoomID, mapID: string, startPositions: RoomPosition[]): MapArray | undefined;
    GenerateImpassableMap(room: Room): MapArray | undefined;
    GenerateSpawnEnergyMap(room: Room): MapArray | undefined;
    GenerateRefillMap(room: Room): MapArray | undefined;
    FindPathFrom(x: number, y: number, distMap: MapArray, pathableMap: MapArray, targetDist?: number): { x: number, y: number, dist: number, index: number }[] | ERR_NO_PATH;
}
interface RunArgs {
    creep: Creep;
    actionType: ActionType;

    target?: any;
    amount?: number;
    message?: string;
    resourceType?: ResourceConstant;
}*/