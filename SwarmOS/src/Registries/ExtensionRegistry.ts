const ExtensionRegistry_LogContext: LogContext = {
    logID: "ExtensionRegistry",
    logLevel: LOG_INFO
}

export class ExtensionRegistry implements IExtensionRegistry {
    constructor(logger: IKernelLoggerExtensions) {
        this._logger = logger.CreateLogContext(this.logID, this.logLevel);
        this.registry = {};
        this.register(EXT_Registry, this);
    }
    protected get log() {
        return this._logger;
    }
    private _logger: ILogger;
    protected get logID() {
        return ExtensionRegistry_LogContext.logID;
    }
    protected get logLevel(): LogLevel {
        return ExtensionRegistry_LogContext.logLevel!;
    }

    private registry: { [interfaceId: string]: IPackageExtension };
    register(interfaceId: string, extension: IPackageExtension): boolean {
        if (this.registry[interfaceId]) {
            this.log.warn(`Interface Id already registered: ${interfaceId}`);
        }
        this.log.debug(`Registered extension: ${interfaceId}`);
        this.registry[interfaceId] = extension;
        return true;
    }
    unregister(interfaceId: string): boolean {
        if (this.registry[interfaceId]) {
            this.log.debug(`Unregistered ${interfaceId}`);
            delete this.registry[interfaceId]
            return true;
        } else {
            this.log.error(`Interface Id not registered: ${interfaceId}`);
            return false;
        }
    }
    get(interfaceId: string): IPackageExtension | undefined {
        if (!this.registry[interfaceId]) return;
        return this.registry[interfaceId];
    }
    getKernel(): IKernel {
        return this.get(EXT_Kernel) as IKernel;
    }
}