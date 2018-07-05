export abstract class BasicProcess<T extends MemBase> implements IProcess {
    constructor(protected context: IProcessContext) { }

    @extensionInterface(EXT_Registry)
    protected extensions!: IExtensionRegistry;
    @extensionInterface(EXT_Kernel)
    protected kernel!: IKernelExtensions;
    @extensionInterface(EXT_MapDirectory)
    protected mapper!: IMapDirectory;
    @extensionInterface(EXT_Sleep)
    protected sleeper!: IKernelSleepExtension;

    get memory(): T { return this.context.memory as T; }
    get pkgName(): string { return this.context.pkgName; }
    get pid(): PID { return this.context.pid; }
    get parentPID(): PID { return this.context.pPID; }
    GetParentProcess<K extends IProcess>(): K | undefined {
        return this.parentPID ? this.kernel.getProcessByPID(this.parentPID) as K : undefined;
    }

    get log() { return this.context.log; }
    get rngSeed(): number { return this.context.rngSeed; }

    PrepTick?(): void;
    abstract RunThread(): ThreadState;
    EndTick?(): void;

    protected EndProcess(cbVal?: string) {
        let proc = this.GetParentProcess();
        if (proc) {
            if (this.memory.HC && proc[this.memory.HC]) {
                this.sleeper.wake(this.parentPID);
                cbVal = cbVal || this.memory.CV;
                if (cbVal) {
                    proc[this.memory.HC](cbVal, this.pid); // Notify the parent using the given callback function.
                }
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
        let pid = this.kernel.startProcess(id, '/TEMP/PKGProvider', Object.assign({}, startContext));
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
    @extensionExposure(EXT_Kernel)
    kernel!: IKernelExtensions;

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

function extensionExposure(interfaceID: string): (target: any, propertyKey: string) => any {
    return function (target: any, propertyKey: string): any {
        let value: IPackageExtension;
        return {
            get() {
                if (!value) {
                    value = this.extensionRegistry.get(interfaceID) as any
                }

                return value;
            }
        }
    }
}
global['extensionExposure'] = extensionExposure;

function extensionInterface(interfaceID: string): (target: any, propertyKey: string) => any {
    return function (target: any, propertyKey: string): any {
        let value: IPackageExtension
        return {
            get() {
                if (!value) {
                    value = this.context.getExtensionInterface(interfaceID);
                }
                return value;
            }
        }
    }
}
global['extensionInterface'] = extensionInterface;