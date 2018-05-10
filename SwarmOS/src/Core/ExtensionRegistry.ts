export class ExtensionRegistry implements IPosisExtension {
    constructor() {
        this.registry = {};
        this.register('extRegistry', this);
    }
    get log() {
        return Logger;
    }

    private registry: { [interfaceId: string]: IPosisExtension };
    register(interfaceId: string, extension: IPosisExtension): boolean {
        if (this.registry[interfaceId]) {
            this.log.warn(`Interface Id already registered: ${interfaceId}`);
        }
        this.log.debug(`Registered ${interfaceId}`);
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
    getExtension(interfaceId: string): IPosisExtension | undefined {
        if (!this.registry[interfaceId]) return;
        return this.registry[interfaceId];
    }
}