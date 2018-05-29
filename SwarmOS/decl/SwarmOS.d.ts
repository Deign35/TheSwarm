declare interface IPackage<MemBase> {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry): void;
}
declare interface IKernel extends IKernelExtensions, IKernelSleepExtension {
    loop(): void;
    log: IKernelLoggerExtensions;
}
declare interface IProcessRegistry {
    register(pkgName: string, constructor: _ProcessConstructor): boolean;
    createNewProcess(name: string, context: IProcessContext): IProcess | undefined;
}
declare interface IProcess {
    pkgName: string;
    pid: PID;
    parentPID: PID;
    rngSeed: number;

    PrepTick?(): void;
    EndTick?(): void;
    RunThread(): ThreadState;
}
declare interface _ProcessConstructor {
    new(context: IProcessContext): IProcess;
}
declare interface IProcessContext {
    readonly memory: MemBase;
    readonly pkgName: string;
    readonly pid: PID;
    readonly pPID: PID;
    readonly isActive: boolean;
    readonly rngSeed: number;
}

declare interface ProcInfo {
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

declare type CreepDefinition = CreepBody[];
declare interface CreepBody {
    cost: number;
    lvl: number;
    ct_ID: CT_ALL;
    ctref_ID: CTREF_ALL;

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