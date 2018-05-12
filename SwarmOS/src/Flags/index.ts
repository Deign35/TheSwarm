import { bundle as FlagBase } from "Flags/FlagBase"

export const flagBundle: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        FlagBase.install(processRegistry, extensionRegistry);
    }
}