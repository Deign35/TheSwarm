export abstract class ExtensionBase implements IPackageExtension {
    constructor(protected extensionRegistry: IExtensionRegistry) {
        this._logger = (extensionRegistry.get(EXT_Logger) as IKernelLoggerExtensions)!.CreateLogContext(this.logID, this.logLevel);
    }
    @extensionExposure(EXT_Kernel)
    kernel!: IKernelExtensions;

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

function extensionExposure(interfaceID: string): (target: any, propertyKey: string) => any {
    return function (target: any, propertyKey: string): any {
        let value: IPackageExtension;
        return {
            get() {
                if (!value) {
                    value = this.extensionRegistry.get(interfaceID) as any
                }

                return value;
            }
        }
    }
}
global['extensionExposure'] = extensionExposure;