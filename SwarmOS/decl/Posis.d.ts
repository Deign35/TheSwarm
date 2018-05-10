/** Bundle for programs that are logically grouped */
declare interface IPosisBundle<IDefaultRootMemory> {
    /** host will call that once, possibly outside of main loop, registers all bundle processes here */
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry): void;
    /** image name of root process in the bundle, if any */
    rootImageName?: string;
    /** function returning default starting memory for root process, doubles as public parameter documentation */
    makeDefaultRootMemory?: (override?: IDefaultRootMemory) => IDefaultRootMemory;
}
declare interface IPosisExtension { }
declare interface IPosisExtensionRegistry extends IPosisExtension {
    getExtension(interfaceId: string): IPosisExtension | undefined;
    register(interfaceId: string, extension: IPosisExtension): boolean;
    unregister(interfaceId: string): boolean;
}
declare interface IPosisInterfaces {
    baseKernel: IPosisKernel;
    sleep: IPosisSleepExtension;
    extRegistry: IPosisExtensionRegistry;
    roomView: RoomExtensions;
    CreepSpawner: IPosisSpawnExtension;

    spawn?: IPosisSpawnExtension;
    coop?: IPosisCooperativeScheduling;
    //segments?: IPosisSegmentsExtension;
    [index: string]: IPosisExtension | undefined;
}
declare interface RoomExtensions extends IPosisExtension {
    RefreshRoomStructures(roomID: string, forceUpdate?: boolean): void;
    AddStructure(structure: Structure): void;
    DEBUG_ForceResetRoomMemory(roomID: string): void;
    RefreshRoom(roomID: string): void;
    GetRoomData(roomID: string, forceUpdate?: boolean): RoomData_Memory | undefined
}

declare interface IPosisKernel extends IPosisExtension {
    installBundle(bundle: IPosisBundle<any>): void;
    installBundles(bundles: IPosisBundle<any>[]): void;
    /**
     * beings running a process
     * @param imageName registered image for the process constructor
     * @param startContext context for a process
     */
    startProcess(imageName: string, startContext: any): { pid: PID; process: IPosisProcess } | undefined;

    /**
     * killProcess also kills all children of this process
     * note to the wise: probably absorb any calls to this that would wipe out your entire process tree.
     * @param pid
     */
    killProcess(pid: PID): void;

    /**
     * gets the instance of a running process
     * @param pid
     * @returns process instance or undefined if the pid is invalid
     */
    getProcessById(pid: PID): IPosisProcess | undefined;

    /**
     * passing undefined as parentId means "make me a root process"
     * i.e. one that will not be killed if another process is killed
     * @param pid
     * @param parentId
     * @returns `true` if process was successfully reparented
     */
    setParent(pid: PID, parentId?: PID): boolean;
}
declare interface IPosisProcess {
    /**
     * Main function, implement all process logic here.
     */
    run(): void;

    /** ID */
    readonly pid: PID;
    /** process state */
    readonly state: ProcessState;
}
/**
 * Bundle: Don't write to context object (including setting new props on it), host will likely freeze it anyway.
 * Host: freeze the thing!
 */
declare interface IPosisProcessConstructor {
    new(context: IPosisProcessContext): IPosisProcess;
}
declare interface IPosisProcessContext {
    /** private memory */
    readonly memory: any;
    /** image name (maps to constructor) */
    readonly imageName: string;
    /** ID */
    readonly pid: PID;
    /** Parent ID */
    readonly pPID: PID;
    /** process state */
    readonly state: ProcessState;
    queryPosisInterface<T extends keyof IPosisInterfaces>(interfaceId: T): IPosisInterfaces[T];
}
declare interface IPosisProcessRegistry {
    /**
     * name your processes' image names with initials preceding, like ANI/MyCoolPosisProgram (but the actual class name can be whatever you want)
     * if your bundle consists of several programs you can pretend that we have a VFS: "ANI/MyBundle/BundledProgram1"
     */
    register(imageName: string, constructor: IPosisProcessConstructor): boolean;
    getNewProcess(name: string, context: IPosisProcessContext): IPosisProcess | undefined;
}
declare type PID = string | number;
declare interface IPosisCooperativeScheduling {
    /** CPU used by process so far. Might include setup time kernel chooses to charge to the process. */
    readonly used: number;
    /** CPU budget scheduler allocated to this process. */
    readonly budget: number;
    /**
     * Process can wrap function and yield when it is ready to give up for the tick or can continue if CPU is available.
     * optionally yield a shutdown function to perform shutdown tasks like saving current state
     */
    wrap?(makeIterator: () => IterableIterator<void | (() => void)>): void;
}
declare interface IPosisSleepExtension {
    /**
     * puts currently running process to sleep for a given number of ticks
     * @param ticks number of ticks to sleep for
     */
    sleep(ticks: number): void;
}
/*
declare interface IPosisSegmentsExtension {
    // Returns undefined if segment isn't loaded,
    // else parsed JSON if contents is JSON, else string
    load(id: number): IPosisSegmentsValue | undefined;
    // marks segment for saving, implementations
    // may save immediately or wait until end of tick
    // subsequent load calls within the same tick should
    // return this value
    save(id: number, value: IPosisSegmentsValue): void;
    // Should add ID to active list
    activate(id: number): void;
}
declare interface IPosisSegmentsValue { }
*/
declare const enum EPosisSpawnStatus {
    ERROR = -1,
    QUEUED,
    SPAWNING,
    SPAWNED
}
/*
 * NOT FINAL, discussions still underway in slack #posis
 *
 * process calls spawnCreep, checks status, if not ERROR, poll
 * getStatus until status is SPAWNED (Handling ERROR if it happens),
 * then call getCreep to get the creep itself
 */
declare interface IPosisSpawnExtension {
    /**
     * Queues/Spawns the requested creep
     * @param opts options for how and where to spawn the requested creep
     * @returns a unique id related to this specific creep request
     */
    spawnCreep(opts: SpawnData_SpawnCard): string;
    /**
     * Used to see if its been dropped from queue
     * @param id an id returned by spawnCreep()
     */
    getStatus(id: string): {
        status: EPosisSpawnStatus
        message?: string
    };
    /**
     * Get the currently spawning creep
     * @param id an id returned by spawnCreep()
     * @returns Creep object or undefined if the creep does not exist yet
     */
    getCreep(id: string): Creep | undefined;
    /**
     * Cancel a previously ordered Creep (`spawnCreep`).
     * @param id an id returned by spawnCreep()
     * @returns `true` if it was cancelled successfully.
     */
    cancelCreep(id: string): boolean;
}

declare interface ISpawnDef {
    body: BodyPartConstant[];
    cost: number;
}

declare interface ProcessInfo {
    pid: PID;
    pPID?: PID;
    name: string;
    status: ProcessState;
    begun: number;

    wake?: number;
    ended?: number;
    //process?: IPosisProcess;
    error?: string;
}

declare interface ProcessTable {
    [id: string]: ProcessInfo;
}

declare interface ProcessMemoryTable {
    [id: string]: {};
}

