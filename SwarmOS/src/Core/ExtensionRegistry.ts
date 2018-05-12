export class ExtensionRegistry implements IPackageExtension {
    constructor() {
        this.registry = {};
        this.register(EXT_Registry, this);
    }
    get log() {
        return Logger;
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
    getExtension(interfaceId: string): IPackageExtension | undefined {
        if (!this.registry[interfaceId]) return;
        return this.registry[interfaceId];
    }
}