import { OSPackage as CLI } from "ColonyManagement/SwarmCLI";

export const ColonyManagementPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        CLI.install(processRegistry, extensionRegistry);
    }
}