import { bundle as FlagBase } from "Flags/FlagBase"

export const flagBundle: IPosisBundle<{}> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        FlagBase.install(processRegistry, extensionRegistry);
    }
}