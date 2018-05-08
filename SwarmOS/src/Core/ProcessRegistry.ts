export class ProcessRegistry implements IPosisProcessRegistry {
    constructor() { }
    private registry: { [name: string]: IPosisProcessConstructor } = {};
    register(name: string, constructor: IPosisProcessConstructor): boolean {
        if (this.registry[name]) {
            Logger.error(`Name already registered: ${name}`);
            return false;
        }
        Logger.debug(`Registered ${name}`);
        this.registry[name] = constructor;
        return true;
    }
    getNewProcess(name: string, context: IPosisProcessContext): IPosisProcess | undefined {
        if (!this.registry[name]) return;
        Logger.debug(`Created ${name}`);
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
    SetProcessToSleep(ticks: number) {
        let sleeper = this.context.queryPosisInterface("sleep");
        sleeper.sleep(ticks);
    }

    abstract run(): void;
}