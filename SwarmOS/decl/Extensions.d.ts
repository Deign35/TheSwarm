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
    [EXT_Sleep]: IKernelSleepExtension;
    [EXT_Logger]: IKernelLoggerExtensions;
    [EXT_SpawnManager]: ISpawnManagerExtensions;
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
    getKernel(): IKernel;
    register(interfaceId: string, extension: IPackageExtension): boolean;
    unregister(interfaceId: string): boolean;
}

/**
 * Extensions for processes to interface with the OS kernel
 */
declare interface IKernelExtensions extends IPackageExtension {
    installPackages(packages: IPackage<MemBase>[]): void;
    startProcess(packageName: string, startContext: MemBase): PID;
    killProcess(pid?: PID, msg?: string): void;
    getProcessByPID(pid: PID): IProcess | undefined;
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
    DumpLogToConsole(): void;
}

/**
 * Allows a process to be put to sleep or awoken
 */
declare interface IKernelSleepExtension extends IPackageExtension {
    sleep(pid: PID, ticks: number): void;
    wake(pid: PID): void;
}

/**
 * Extension for processes to be able to request creep spawning.
 */
declare interface ISpawnManagerExtensions extends IPackageExtension {
    cancelRequest(id?: SpawnRequestID): boolean;
    getRequestContext(id?: SpawnRequestID): SpawnContext | undefined;
    getRequestStatus(id?: SpawnRequestID): SpawnState;
    requestSpawn(context: SpawnContext, location: RoomID, spawnPriority: Priority,
        maxDistance?: number, startMem?: CreepMemory): SpawnID;
}