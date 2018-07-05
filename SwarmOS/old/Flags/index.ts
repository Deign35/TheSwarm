import { OSPackage as FlagBase } from "Flags/FlagBase"

export const FlagPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        FlagBase.install(processRegistry, extensionRegistry);
    }
}