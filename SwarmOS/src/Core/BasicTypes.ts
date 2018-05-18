export abstract class BasicProcess<ProcessMemory> implements IProcess {
    @extensionInterface(EXT_Kernel)
    protected kernel!: IKernelProcessExtensions;
    @extensionInterface(EXT_Registry)
    protected extensions!: IExtensionRegistry;
    @extensionInterface(EXT_SpawnRegistry)
    protected spawnRegistry!: ISpawnRegistryExtensions;
    @extensionInterface(EXT_Sleep)
    protected sleeper!: IKernelSleepExtension;

    constructor(protected context: IProcessContext) {
        this._logger = context.getPackageInterface(EXT_Logger).CreateLogContext(this.logID, this.logLevel);
        this.OnProcessInstantiation();
    }
    protected OnProcessInstantiation(): void { }

    private _logger: ILogger;
    protected get log(): ILogger { return this._logger; }
    protected get logID() { return DEFAULT_LOG_ID; }
    protected get logLevel(): LogLevel { return DEFAULT_LOG_LEVEL; }

    protected get memory(): ProcessMemory { return this.context.memory as ProcessMemory; }

    get pkgName(): string { return this.context.pkgName; }
    get pid(): PID { return this.context.pid; }
    get parentPID(): PID { return this.context.pPID; }

    run(): void {
        let startCPU = 0;
        if (this.isInDebugMode) {
            startCPU = Game.cpu.getUsed();
            this.log.debug(() => `Begin ${this.pkgName}(${this.pid}): ${startCPU}`);
        }

        this.executeProcess();

        if (this.isInDebugMode) {
            let endCPU = Game.cpu.getUsed();
            this.log.debug(() => `End ${this.pkgName}(${this.pid}): ${endCPU - startCPU}`);
            this.executeDebugCode();
            let endDebugCPU = Game.cpu.getUsed();
            this.log.debug(() => `End Debug ${this.pkgName}(${this.pid}): ${endDebugCPU - endCPU}`);
        }
    }
    get isInDebugMode(): boolean { return false; }
    protected executeDebugCode(): void { }

    protected abstract executeProcess(): void;
}
declare interface IThreadProcess extends IProcess {
    ThreadID?: ThreadID
    RunThread(): ThreadState;
}

export abstract class ThreadProcess<T extends ThreadMemory> extends BasicProcess<T> implements IThreadProcess {
    @extensionInterface(EXT_ThreadRegistry)
    protected thread!: IThreadRegistryExtensions;
    get ThreadID() { return this.memory.registeredThreadID; }

    protected executeProcess(): void { }
    abstract RunThread(): ThreadState;

    OnProcessInstantiation() {
        this.RegisterThread();
    }

    RegisterThread() {
        if (this.ThreadID) {
            this.thread.RegisterAsThread(this.pid, this.ThreadID);
        }
    }
}


export abstract class ExtensionBase implements IPackageExtension {
    constructor(protected extensionRegistry: IExtensionRegistry) {
        this._logger = (extensionRegistry.get(EXT_Logger) as IKernelLoggerExtensions)!.CreateLogContext(this.logID, this.logLevel);
    }

    private _logger: ILogger;
    protected get log(): ILogger {
        return this._logger;
    }
    protected get logID(): string {
        return DEFAULT_LOG_ID;
    }
    protected get logLevel(): LogLevel {
        return DEFAULT_LOG_LEVEL;
    }
}

function extensionInterface(interfaceId: string): (target: any, propertyKey: string) => any {
    return function (target: any, propertyKey: string): any {
        let value: IPackageExtension
        return {
            get() {
                if (!value) {
                    value = this.context.getPackageInterface(interfaceId);
                }
                return value;
            }
        }
    }
}

global['extensionInterface'] = extensionInterface;