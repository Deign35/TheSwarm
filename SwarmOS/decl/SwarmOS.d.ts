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
    parentPID?: PID;
    rngSeed?: number;
    memory: MemBase

    PrepTick?(): void;
    EndTick?(): void;
    RunThread(): ThreadState;
}

declare interface _ProcessConstructor {
    new(context: IProcessContext): IProcess;
}

declare interface IProcessContext {
    readonly log: ILogger;
    readonly memory: MemBase;
    readonly pkgName: string;
    readonly pid: PID;
    readonly pPID: PID;
    readonly isActive: boolean;
    readonly rngSeed: number;
    readonly memPath: string;
}

declare interface ProcInfo {
    PKG: string;// Package name to load
    pid: PID;   // process id
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

declare interface IWorkerGroupProcess extends IProcess {
    AddCreep(creepID: CreepID): void;
    RemoveCreep(creepID: CreepID): void;
}


declare interface IFolder {
    SaveFile<T>(fileName: string, mem: IFile<T>): void;
    GetFile<T>(fileName: string): IFile<T> | undefined;
    DeleteFile(fileName: string): void;
    GetFolder(folderName: string): IFolder;
    CreateFolder(folderName: string): void;
    DeleteFolder(): void;
}
declare interface IFile<T> { }
declare interface IFileSystem extends IPackageExtension {
    GetFolder(pathStr: string): IFolder | undefined
    EnsurePath(path: string): void
    CreateFolder(path: string, folderName: string): void;
    DeleteFolder(path: string, folderName: string): void;
    SaveFile<T>(path: string, fileName: string, mem: IFile<T>): void;
    GetFile<T>(path: string, fileName: string): IFile<T> | undefined;
    DeleteFile(path: string, fileName: string): void;
    CopyFile(fromPath: string, fileName: string, toPath: string, deleteOriginal?: boolean, newFileName?: string): boolean

    SplitPath(pathStr: string): { path: string, name: string };
}

declare const MasterFS: IFileSystem;