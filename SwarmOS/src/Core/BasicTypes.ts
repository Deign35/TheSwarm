export abstract class BasicProcess<T extends MemBase> implements IProcess {
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

    protected get memory(): T { return this.context.memory as T; }

    get pkgName(): string { return this.context.pkgName; }
    get pid(): PID { return this.context.pid; }
    get parentPID(): PID { return this.context.pPID; }
    get threadState(): ThreadState { return ThreadState_Active; }// this.memory.sta || ThreadState_Inactive; }
    get threadPriority(): Priority { return Priority_Hold; }//this.memory.pri || Priority_Hold; }

    PrepTick?(): void;
    EndTick?(): void;
    abstract RunThread(): ThreadState;
}

const SCAN_FREQUENCY = 15;
export abstract class PackageProviderBase<T extends PackageProviderMemory> extends BasicProcess<T> {
    protected OnProcessInstantiation() {
        if (!this.memory.services) {
            this.memory.services = {};
        }
    }

    protected abstract RequiredServices: SDictionary<ProviderService>;
    get ScanFrequency() { return SCAN_FREQUENCY; }

    addPKGService(serviceID: string, id: string, parentPID?: PID, startContext: any = {}) {
        this.log.info(() => `Adding service ${id}`);
        let pid = this.kernel.startProcess(id, Object.assign({}, startContext));
        this.kernel.setParent(pid, parentPID);
        this.memory.services[serviceID] = { pid: pid, serviceID };
    }

    RunThread(): ThreadState {
        let ids = Object.keys(this.RequiredServices)
        for (let i = 0, length = ids.length; i < length; i++) {
            let service = this.memory.services[ids[i]];
            let process = (service && service.pid) ? this.kernel.getProcessByPID(service.pid) : undefined;

            if (!service || !process) {
                this.log.info(() => `Initializing package service ${ids[i]}`);

                let initData = this.RequiredServices[ids[i]];
                this.addPKGService(ids[i], initData.processName, initData.startContext);
                service = this.memory.services[ids[i]];
                process = (service && service.pid) ? this.kernel.getProcessByPID(service.pid) : undefined;

                if (!service || !process) {
                    this.log.error(() => `Failed to restart package service ${ids[i]}`);
                    this.kernel.killProcess(this.pid);
                    continue;
                }
            }
        }

        this.sleeper.sleep(this.pid, this.ScanFrequency);
        return ThreadState_Done;
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