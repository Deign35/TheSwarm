declare interface IPackage<MemBase> {
    /** host will call that once, possibly outside of main loop, registers all bundle processes here */
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry): void;
    /** image name of root process in the bundle, if any */
    rootImageName?: string;
}
declare interface IPackageExtension { }
declare interface IExtensionRegistry extends IPackageExtension {
    getExtension(interfaceId: string): IPackageExtension | undefined;
    register(interfaceId: string, extension: IPackageExtension): boolean;
    unregister(interfaceId: string): boolean;
}
declare interface IPackageInterfaces {
    [EXT_CreepSpawner]: ISpawnExtension;
    [EXT_Flags]: undefined;
    [EXT_Interrupt]: undefined;
    [EXT_Kernel]: IKernel;
    [EXT_Registry]: IExtensionRegistry;
    [EXT_RoomView]: IRoomDataExtension;
    [EXT_Sleep]: IKernelSleepExtension;
    //coop?: IPosisCooperativeScheduling; // (TODO) look into what coop scheduling is and how it works
    [index: string]: IPackageExtension | undefined;
}
declare interface IRoomDataExtension extends IPackageExtension {
    ForceResetRoomMemory(roomID: string): void;
    GetRoomData(roomID: string, forceUpdate?: boolean): RoomData_Memory | undefined
}

declare interface IKernel extends IPackageExtension {
    installPackages(bundles: IPackage<any>[]): void;
    startProcess(imageName: string, startContext: any): { pid: PID; process: IProcess } | undefined;
    killProcess(pid: PID): void;
    getProcessById(pid: PID): IProcess | undefined;
    setParent(pid: PID, parentId?: PID): boolean;
}
declare interface IProcess {
    run(): void;
}
declare interface _ProcessConstructor {
    new(context: IProcessContext): IProcess;
}
declare interface IProcessContext {
    readonly memory: MemBase;
    readonly imageName: string;
    readonly pid: PID;
    readonly pPID: PID;
    readonly isActive: boolean;
    queryPosisInterface<T extends keyof IPackageInterfaces>(interfaceId: T): IPackageInterfaces[T];
}
declare interface IProcessRegistry {
    register(imageName: string, constructor: _ProcessConstructor): boolean;
    createNewProcess(name: string, context: IProcessContext): IProcess | undefined;
}
declare type PID = string | number;

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
declare interface IKernelSleepExtension {
    sleep(ticks: number, pid: PID): void;
    wake(pid: PID): void;
}

declare interface ISpawnExtension {
    cancelRequest(id: string): boolean;
    getRequestStatus(id: string): SpawnState;
    requestCreep(opts: SpawnData_SpawnCard): string;
}

declare interface ISpawnDef {
    body: BodyPartConstant[];
    cost: number;
}

declare interface ProcInfo {
    ex: boolean;// Executing -- If this process is currently executing
    PKG: string;// Package name to load
    pid: PID;   // process id
    st: number; // Started -- When the process started
    pP?: PID;   // parent pid
    end?: number; // Ended -- When the process ended
    err?: string; // Error
    sl?: number;// Sleep -- Process sleeping until 
}

declare interface ProcessTable {
    [id: string]: ProcInfo;
}

declare interface ProcessMemory {
    [id: string]: {};
}



declare interface IInteruptExtension {
    IsSubscribed(id: string, pid: PID): boolean;
    Subscribe(id: string, pid: PID): void;
    UnSubscribe(id: string, pid: PID): void;
    Notify(id: string): void;
}