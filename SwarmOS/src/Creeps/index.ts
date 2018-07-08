import { OSPackage as TestProcess } from "./TestProcess_Memory";

export const CLIPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        TestProcess.install(processRegistry, extensionRegistry);
    }
}