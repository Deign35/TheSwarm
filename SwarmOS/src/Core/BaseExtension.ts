export abstract class ExtensionBase implements IPosisExtension {
    constructor(protected extensionRegistry: IPosisExtensionRegistry) {
    }
    protected abstract get memory(): any;
}