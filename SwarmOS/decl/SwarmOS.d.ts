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
    ThreadID?: ThreadID
    PKG: ScreepsPackage;
    RunThread(): ThreadState;
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
    th?: boolean;//Active thread
}

declare type ProcessTable = {
    [pid in PID]: ProcInfo;
}

declare type CreepDefinition = CreepBody[];
declare interface CreepBody {
    cost: number;
    lvl: number;
    ct_ID: CT_ALL;
    ctref_ID: CTREF_ALL;
    pkg_ID: ScreepsPackage;

    m: number;      // Move
    a?: number      // Attack
    c?: number;     // Carry
    cl?: number;    // Claim
    h?: number;     // Heal
    r?: number;     // RangedAttack
    t?: number;     // Tough
    w?: number;     // Work
}
declare interface CreepBodiesReference {
    CT_id: string,
    lvl: number
}

declare interface ProviderService extends IProcess {
    processName: string,
    startContext?: any
}