/**
 * Package extensions are accessible functionality that can be accessed regardless of whether the host process is running.
 * These will access memory and adjust relevant entries.  The managers will run and operate on that data when operational.
 * 
 * Add new package extensions to this page and add it to IPackageInterfaces
 */
declare interface IPackageExtension {

}

/**
 * Package extensions can be accessed from any process via the ExtensionRegistry.
 */
declare interface IPackageInterfaces {
    [index: string]: IPackageExtension | undefined;
    [EXT_Registry]: IExtensionRegistry;

    [EXT_CreepSpawner]: ISpawnExtension;
    [EXT_Flags]: undefined;
    [EXT_Interrupt]: IKernelNotificationsExtension;
    [EXT_Kernel]: IKernelProcessExtensions;
    [EXT_RoomView]: IRoomDataExtension;
    [EXT_Sleep]: IKernelSleepExtension;
    [EXT_Logger]: IKernelLoggerExtensions;
}

/**
 * A process can access the registry via this function.
 */
declare interface IProcessContext {
    getPackageInterface<T extends keyof IPackageInterfaces>(interfaceId: T): IPackageInterfaces[T];
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
declare interface IKernelProcessExtensions extends IPackageExtension {
    installPackages(packages: IPackage<any>[]): void;
    startProcess(packageName: string, startContext: any): { pid: PID; process: IProcess } | undefined;
    killProcess(pid: PID): void;
    getProcessById(pid: PID): IProcess | undefined;
    setParent(pid: PID, parentId?: PID): boolean;
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
    IsSubscribed(id: string): boolean;
    Notify(id: string): void;
    Subscribe(id: string): void;
    UnSubscribe(id: string): void;
}

/**
 * Allows a process to be put to sleep or awoken
 */
declare interface IKernelSleepExtension extends IPackageExtension {
    sleep(ticks: number): void;
    wake(pid: PID): void;
}

/**
 * Room data retrieves currently saved information for a given room.
 * Giving back constructionSites, structures, sources, and other information.
 * Is updated on a regular schedule by the RoomManager.
 */
declare interface IRoomDataExtension extends IPackageExtension {
    ForceResetRoomMemory(roomID: string): void;
    GetRoomData(roomID: string, forceUpdate?: boolean): RVD_RoomMemory | undefined;
}

/**
 * Extension for processes to be able to request creep spawning.
 */
declare interface ISpawnExtension extends IPackageExtension {
    cancelRequest(id: string): boolean;
    getRequestStatus(id: string): SpawnState;
    requestCreep(opts: SpawnerRequest): CreepContext;
}



/*
declare interface IPosisCooperativeScheduling {
    /** CPU used by process so far. Might include setup time kernel chooses to charge to the process. *
    readonly used: number;
    /** CPU budget scheduler allocated to this process. *
    readonly budget: number;
    /**
     * Process can wrap function and yield when it is ready to give up for the tick or can continue if CPU is available.
     * optionally yield a shutdown function to perform shutdown tasks like saving current state
     *
    wrap?(makeIterator: () => IterableIterator<void | (() => void)>): void;
}
*/