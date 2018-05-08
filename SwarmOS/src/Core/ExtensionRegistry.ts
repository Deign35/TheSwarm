export class ExtensionRegistry implements IPosisExtension {
    constructor() {
        this.registry = {};
        this.register('extRegistry', this);
    }

    private registry: { [interfaceId: string]: IPosisExtension };
    register(interfaceId: string, extension: IPosisExtension): boolean {
        if (this.registry[interfaceId]) {
            Logger.warn(`Interface Id already registered: ${interfaceId}`);
        }
        Logger.debug(`Registered ${interfaceId}`);
        this.registry[interfaceId] = extension;
        return true;
    }
    unregister(interfaceId: string): boolean {
        if (this.registry[interfaceId]) {
            Logger.debug(`Unregistered ${interfaceId}`);
            delete this.registry[interfaceId]
            return true;
        } else {
            Logger.error(`Interface Id not registered: ${interfaceId}`);
            return false;
        }
    }
    getExtension(interfaceId: string): IPosisExtension | undefined {
        if (!this.registry[interfaceId]) return;
        return this.registry[interfaceId];
    }
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

export abstract class ExtensionBase implements IPosisExtension {
    constructor(protected extensionRegistry: IPosisExtensionRegistry) {
    }
    protected abstract get memory(): any;
}

global['posisInterface'] = posisInterface;