export class ProcessRegistry implements IProcessRegistry {
    constructor(logger: IKernelLoggerExtensions) {
        this._logger = logger.CreateLogContext("ProcessRegistry", LOG_INFO);
    }

    private _logger: ILogger;
    protected get log() {
        return this._logger;
    }

    private registry: { [name: string]: _ProcessConstructor } = {};
    register(name: ScreepsPackage, constructor: _ProcessConstructor): boolean {
        if (this.registry[name]) {
            this.log.error(`Name already registered: ${name}`);
            return false;
        }
        this.log.info(() => `Registered Process: ${name}`);
        this.registry[name] = constructor;
        return true;
    }
    createNewProcess(name: string, context: IProcessContext): IProcess | undefined {
        if (!this.registry[name]) return;
        this.log.info(() => `Created ${name}`);
        return new this.registry[name](context);
    }
}
