const ProcessRegistry_LogContext: LogContext = {
    logID: "ProcessRegistry",
    logLevel: LOG_DEBUG
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
