let logger = new SwarmLogger("[ExtensionRegistry]");

export class ExtensionRegistry implements IPosisExtension {
    constructor() {
        this.registry = {};
        this.register('SwarmExtensionRegistry', this);
    }

    private registry: { [interfaceId: string]: IPosisExtension };
    register(interfaceId: string, extension: IPosisExtension): boolean {
        if (this.registry[interfaceId]) {
            logger.warn(`Interface Id already registered: ${interfaceId}`);
        }
        logger.debug(`Registered ${interfaceId}`);
        this.registry[interfaceId] = extension;
        return true;
    }
    unregister(interfaceId: string): boolean {
        if (this.registry[interfaceId]) {
            logger.debug(`Unregistered ${interfaceId}`);
            delete this.registry[interfaceId]
            return true;
        } else {
            logger.error(`Interface Id not registered: ${interfaceId}`);
            return false;
        }
    }
    getExtension(interfaceId: string): IPosisExtension | undefined {
        if (!this.registry[interfaceId]) return;
        return this.registry[interfaceId];
    }
}

export function posisInterface(interfaceId: string): (target: any, propertyKey: string) => any {
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