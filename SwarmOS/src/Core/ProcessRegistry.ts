const ProcessRegistry_LogContext: LogContext = {
    logID: "ProcessRegistry",
    logLevel: LOG_INFO
}
export class ProcessRegistry implements IProcessRegistry {
    constructor() {
        this.log.CreateLogContext(ProcessRegistry_LogContext);
    }
    protected get log() {
        return Logger;
    }
    private registry: { [name: string]: _ProcessConstructor } = {};
    register(name: string, constructor: _ProcessConstructor): boolean {
        if (this.registry[name]) {
            this.log.error(`Name already registered: ${name}`);
            return false;
        }
        this.log.debug(() => `Registered Process: ${name}`, ProcessRegistry_LogContext.logID);
        this.registry[name] = constructor;
        return true;
    }
    createNewProcess(name: string, context: IProcessContext): IProcess | undefined {
        if (!this.registry[name]) return;
        this.log.debug(() => `Created ${name}`);
        return new this.registry[name](context);
    }
}
