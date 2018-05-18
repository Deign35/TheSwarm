export abstract class BasicProcess<ProcessMemory> implements IProcess {
    @extensionInterface(EXT_Kernel)
    protected kernel!: IKernelProcessExtensions;
    @extensionInterface(EXT_Registry)
    protected extensions!: IExtensionRegistry;
    @extensionInterface(EXT_SpawnRegistry)
    protected spawnRegistry!: ISpawnRegistryExtensions;
    @extensionInterface(EXT_Interrupt)
    protected interrupter!: IKernelNotificationsExtension;
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
    get isInDebugMode(): boolean { return false; }

    onProcessEnd(): void { }
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

    protected executeDebugCode(): void { }
    protected abstract executeProcess(): void;
}

export interface InitData {
    processName: string,
    startContext?: any
}

const SCAN_FREQUENCY = 15;
export abstract class PackageProviderBase<T extends PackageProviderMemory> extends BasicProcess<T> {
    protected OnProcessInstantiation() {
        if (!this.memory.services) {
            this.memory.services = {};
        }
    }

    protected abstract RequiredServices: SDictionary<InitData>;
    get ScanFrequency() { return SCAN_FREQUENCY; }

    addPKGService(serviceID: string, id: string, parentPID?: PID, startContext: any = {}) {
        this.log.info(() => `Adding service ${id}`);
        let result = this.kernel.startProcess(id, Object.assign({}, startContext));
        if (result) {
            this.kernel.setParent(result.pid, parentPID);
            this.memory.services[serviceID] = { pid: result.pid, serviceID };
        }
    }

    protected executeProcess() {
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

        this.sleeper.sleep(this.ScanFrequency);
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

export abstract class Threaded<T extends PackageProviderMemory> extends BasicProcess<T> {
    protected OnProcessInstantiation() {
        if (!this.memory.services) {
            this.memory.services = {};
        }
    }

    protected abstract RequiredServices: SDictionary<InitData>;
    get ScanFrequency() { return SCAN_FREQUENCY; }

    addPKGService(serviceID: string, id: string, parentPID?: PID, startContext: any = {}) {
        this.log.info(() => `Adding service ${id}`);
        let result = this.kernel.startProcess(id, Object.assign({}, startContext));
        if (result) {
            this.kernel.setParent(result.pid, parentPID);
            this.memory.services[serviceID] = { pid: result.pid, serviceID };
        }
    }

    protected executeProcess() {
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

        this.sleeper.sleep(this.ScanFrequency);
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