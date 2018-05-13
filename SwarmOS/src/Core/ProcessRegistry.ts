const ProcessRegistry_LogContext: LogContext = {
    logID: "ProcessRegistry",
    logLevel: LOG_INFO
}
export class ProcessRegistry implements IProcessRegistry {
    constructor() {
        this._logger = this.log.CreateLogContext(this.logID, this.logLevel);
    }
    protected get log() {
        return this._logger;
    }
    private _logger: ILogger;
    protected get logID() {
        return ProcessRegistry_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return ProcessRegistry_LogContext.logLevel!;
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
