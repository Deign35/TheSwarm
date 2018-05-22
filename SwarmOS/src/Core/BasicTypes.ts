export abstract class BasicProcess<T extends MemBase> implements IProcess {
    @extensionInterface(EXT_Kernel)
    protected kernel!: IKernelProcessExtensions;
    @extensionInterface(EXT_Registry)
    protected extensions!: IExtensionRegistry;
    @extensionInterface(EXT_SpawnRegistry)
    protected spawnRegistry!: ISpawnRegistryExtensions;
    @extensionInterface(EXT_Sleep)
    protected sleeper!: IKernelSleepExtension;
    @extensionInterface(EXT_ThreadRegistry)
    protected thread!: IThreadRegistryExtensions;

    constructor(protected context: IProcessContext) {
        this._logger = context.getPackageInterface(EXT_Logger).CreateLogContext(this.logID, this.logLevel);
        this.OnProcessInstantiation();
    }
    protected OnProcessInstantiation(): void { }

    private _logger: ILogger;
    protected get log(): ILogger { return this._logger; }
    protected get logID() { return DEFAULT_LOG_ID; }
    protected get logLevel(): LogLevel { return DEFAULT_LOG_LEVEL; }

    protected get memory(): T { return this.context.memory as T; }

    get pkgName(): string { return this.context.pkgName; }
    get pid(): PID { return this.context.pid; }
    get parentPID(): PID { return this.context.pPID; }
    get threadState(): ThreadState { return this.memory.sta || ThreadState_Inactive; }
    get threadPriority(): Priority { return this.memory.pri || Priority_Hold; }

    abstract PrepTick?(): void;
    abstract EndTick?(): void;
    abstract RunThread(): ThreadState;
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