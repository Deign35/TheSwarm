import { OSPackage as Cartographer } from "./SwarmCartographer";
import { OSPackage as CLI } from "ColonyManagement/SwarmCLI";

export const ColonyManagementPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        Cartographer.install(processRegistry, extensionRegistry);
        CLI.install(processRegistry, extensionRegistry);
    }
}