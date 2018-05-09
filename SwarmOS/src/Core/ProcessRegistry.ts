const ProcessRegistry_LogContext: LogContext = {
    logID: "ProcessRegistry",
    logLevel: LOG_INFO
}
export class ProcessRegistry implements IPosisProcessRegistry {
    constructor() {
        this.log.CreateLogContext(ProcessRegistry_LogContext);
    }
    protected get log() {
        return Logger;
    }
    private registry: { [name: string]: IPosisProcessConstructor } = {};
    register(name: string, constructor: IPosisProcessConstructor): boolean {
        if (this.registry[name]) {
            this.log.error(`Name already registered: ${name}`);
            return false;
        }
        this.log.debug(() => `Registered ${name}`, ProcessRegistry_LogContext.logID);
        this.registry[name] = constructor;
        return true;
    }
    getNewProcess(name: string, context: IPosisProcessContext): IPosisProcess | undefined {
        if (!this.registry[name]) return;
        this.log.debug(() => `Created ${name}`);
        return new this.registry[name](context);
    }
}

export abstract class BaseProcess implements IPosisProcess {
    constructor(protected context: IPosisProcessContext) { }
    @posisInterface("kernel")
    protected kernel!: IPosisKernel
    @posisInterface("extRegistry")
    protected extensions!: IPosisExtensionRegistry;

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
    protected handleMissingMemory() { // (TODO): Implement somewhere
        throw new Error(`${this.imageName}(${this.pid}) memory does not exist.`);
    }

    run(): void {
        let startCPU = Game.cpu.getUsed();
        this.log.trace(() => `Begin ${this.imageName}(${this.pid}): ${startCPU}`);
        if (!this.memory) {
            this.log.warn(() => `${this.imageName} memory init.`)
            this.handleMissingMemory();
        }

        this.log.trace(() => `End ${this.imageName}(${this.pid}): ${Game.cpu.getUsed() - startCPU}`);
    }
}