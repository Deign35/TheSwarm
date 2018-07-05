import { OSPackage as CLIProcessor } from "./CLIProcessor";

export const CLIPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        CLIProcessor.install(processRegistry, extensionRegistry);
    }
}