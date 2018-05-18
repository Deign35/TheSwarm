declare interface IPackage<MemBase> {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry): void;
}
declare interface IKernel extends IKernelProcessExtensions, IKernelSleepExtension/*, IKernelNotificationsExtension*/ {
    loop(): void;
    log: IKernelLoggerExtensions;
}
declare interface IProcessRegistry {
    register(pkgName: string, constructor: _ProcessConstructor): boolean;
    createNewProcess(name: string, context: IProcessContext): IProcess | undefined;
}
declare interface IProcess {
    run(): void;
}
declare interface IThreadProcess extends IProcess {
    GetThread(): IterableIterator<number>;
}

declare type ProcessWithID = { pid: PID; process: IProcess; };
declare interface _ProcessConstructor {
    new(context: IProcessContext): IProcess;
}
declare interface IProcessContext {
    readonly memory: MemBase;
    readonly pkgName: string;
    readonly pid: PID;
    readonly pPID: PID;
    readonly isActive: boolean;
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

declare type ProcessTable = {
    [pid in PID]: ProcInfo;
}


declare interface CreepBodiesReference {
    CT_id: string,
    lvl: number
}

declare interface CreepGroupProcessContext extends IProcessContext {
    loc: RoomID;
}
declare interface ProviderService {
    processName: string,
    startContext?: any
}