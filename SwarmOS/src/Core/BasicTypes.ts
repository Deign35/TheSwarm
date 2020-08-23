export abstract class BasicProcess<T extends MemBase> implements IProcess {
    constructor(protected context: IProcessContext) {
        this._logger = context.getPackageInterface(EXT_Logger).CreateLogContext(this.logID, this.logLevel);
    }

    @extensionInterface(EXT_Kernel)
    protected kernel!: IKernelExtensions;
    @extensionInterface(EXT_Registry)
    protected extensions!: IExtensionRegistry;
    @extensionInterface(EXT_Sleep)
    protected sleeper!: IKernelSleepExtension;

    get memory(): T { return this.context.memory as T; }
    get pkgName(): string { return this.context.pkgName; }
    get pid(): PID { return this.context.pid; }
    get parentPID(): PID { return this.context.pPID; }
    GetParentProcess<K extends IProcess>(): K | undefined {
        return this.parentPID ? this.kernel.getProcessByPID(this.parentPID) as K : undefined;
    }

    private _logger!: ILogger;
    protected get log() { return this._logger; }
    protected get logID() { return DEFAULT_LOG_ID; }
    protected get logLevel(): LogLevel { return DEFAULT_LOG_LEVEL; }
    get rngSeed(): number { return this.context.rngSeed; }

    PrepTick?(): void;
    abstract RunThread(): ThreadState;
    EndTick?(): void;

    protected EndProcess(cbVal?: string) {
        let proc = this.GetParentProcess();
        if (proc) {
            this.sleeper.wake(this.parentPID);
            if (cbVal && this.memory.HC) {
                proc[this.memory.HC](cbVal, this.pid); // Notify the parent using the given callback function.
            }
        }
        this.kernel.killProcess(this.pid);
    }
}

const SCAN_FREQUENCY = 15;
export abstract class PackageProviderBase<T extends PackageProviderMemory> extends BasicProcess<T> {
    protected abstract RequiredServices: SDictionary<ProviderService>;

    private addPKGService(serviceID: string, id: string, parentPID?: PID, startContext: any = {}) {
        this.log.info(() => `Adding service ${id}`);
        let pid = this.kernel.startProcess(id, Object.assign({}, startContext));
        this.kernel.setParent(pid, parentPID);
        this.memory.services[serviceID] = { pid, serviceID };
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
                    this.kernel.killProcess(this.pid, `Failed to restart package service ${ids[i]}`);
                    continue;
                }
            }
        }

        this.sleeper.sleep(this.pid, SCAN_FREQUENCY);
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