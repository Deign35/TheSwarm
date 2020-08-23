const ProcessRegistry_LogContext: LogContext = {
    logID: "ProcessRegistry",
    logLevel: LOG_INFO
}
export class ProcessRegistry implements IProcessRegistry {
    constructor(logger: IKernelLoggerExtensions) {
        this._logger = logger.CreateLogContext(this.logID, this.logLevel);
    }

    private _logger: ILogger;
    protected get log() {
        return this._logger;
    }
    protected get logID() {
        return ProcessRegistry_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return ProcessRegistry_LogContext.logLevel!;
    }

    private registry: { [name: string]: _ProcessConstructor } = {};
    register(name: ScreepsPackage, constructor: _ProcessConstructor): boolean {
        if (this.registry[name]) {
            this.log.error(`Name already registered: ${name}`);
            return false;
        }
        this.log.debug(() => `Registered Process: ${name}`);
        this.registry[name] = constructor;
        return true;
    }
    createNewProcess(name: string, context: IProcessContext): IProcess | undefined {
        if (!this.registry[name]) return;
        this.log.debug(() => `Created ${name}`);
        return new this.registry[name](context);
    }
}
