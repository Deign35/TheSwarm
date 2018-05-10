export abstract class ProcessBase implements IPosisProcess {
    constructor(protected context: IPosisProcessContext) { }
    @posisInterface("kernel")
    protected kernel!: IPosisKernel
    @posisInterface("extRegistry")
    protected extensions!: IPosisExtensionRegistry;
    @posisInterface("CreepSpawner")
    protected spawner!: IPosisSpawnExtension;

    protected get memory(): any {
        return this.context.memory;
    }
    get imageName(): string { // image name (maps to constructor)
        return this.context.imageName;
    }
    get pid(): PID { // ID
        return this.context.pid;
    }
    get parentPID(): PID { // Parent ID
        return this.context.pPID;
    }
    get state() {
        return this.context.state;
    }
    protected get log(): ILogger {
        return Logger;
    }
    SetProcessToSleep(ticks: number) {
        let sleeper = this.context.queryPosisInterface("sleep");
        sleeper.sleep(ticks);
    }
    protected abstract executeProcess(): void;
    protected handleMissingMemory() {
        throw new Error(`${this.imageName}(${this.pid}) memory does not exist.`);
    }

    run(): void {
        let startCPU = Game.cpu.getUsed();
        this.log.debug(() => `Begin ${this.imageName}(${this.pid}): ${startCPU}`);
        if (!this.memory) {
            this.log.warn(() => `${this.imageName} memory init.`)
            this.handleMissingMemory();
        }

        this.executeProcess();
        this.log.debug(() => `End ${this.imageName}(${this.pid}): ${Game.cpu.getUsed() - startCPU}`);
    }
}

export interface InitData {

    processName: string,
    startContext?: any
}
declare type ServiceProviderMemory = {
    services: {
        [id: string]: {
            pid: PID,
            serviceID: string
        }
    }
}

const SCAN_FREQUENCY = 5;
export abstract class ServiceProviderBase extends ProcessBase {
    constructor(protected context: IPosisProcessContext) {
        super(context);
        if (!this.context.memory.services) {
            this.context.memory.services = {};
        }
    }

    protected abstract RequiredServices: SDictionary<InitData>;
    get ScanFrequency() { return SCAN_FREQUENCY; }

    addService(serviceID: string, id: string, parentPID?: PID, startContext: any = {}) {
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
            let process = (service && service.pid) ? this.kernel.getProcessById(service.pid) : undefined;

            if (!service || !process || process.state == ProcessState.Killed) {
                this.log.info(() => `Initializing service ${ids[i]}`);

                let initData = this.RequiredServices[ids[i]];
                this.addService(ids[i], initData.processName, initData.startContext);
                service = this.memory.services[ids[i]];
                process = (service && service.pid) ? this.kernel.getProcessById(service.pid) : undefined;

                if (!service || !process) {
                    this.log.error(() => `Failed to restart service ${ids[i]}`);
                    continue;
                }
            }
        }

        this.SetProcessToSleep(this.ScanFrequency); // Does this work???
    }
}

export abstract class ExtensionBase implements IPosisExtension {
    constructor(protected extensionRegistry: IPosisExtensionRegistry) { }
    protected get log() { return Logger; }

    protected abstract get memory(): any;
}

function posisInterface(interfaceId: string): (target: any, propertyKey: string) => any {
    return function (target: any, propertyKey: string): any {
        let value: IPosisExtension
        return {
            get() {
                if (!value) {
                    value = this.context.queryPosisInterface(interfaceId);
                }
                return value;
            }
        }
    }
}

global['posisInterface'] = posisInterface;