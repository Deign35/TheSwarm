import { OSPackage as ControlGroupPackage } from "CreepGroups/ControlGroup";
import { OSPackage as ExtractionGroupPackage } from "CreepGroups/ExtractionGroup";
import { OSPackage as InfrastructurePackage } from "CreepGroups/InfrastructureGroup";

export const CreepGroupsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        ControlGroupPackage.install(processRegistry, extensionRegistry);
        ExtractionGroupPackage.install(processRegistry, extensionRegistry);
        InfrastructurePackage.install(processRegistry, extensionRegistry);
    }
}