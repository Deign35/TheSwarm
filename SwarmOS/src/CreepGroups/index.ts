import { OSPackage as ControlGroupPackage } from "CreepGroups/ControlGroup";
import { OSPackage as ExtractionGroupPackage } from "CreepGroups/ExtractionGroup";
import { OSPackage as InfrastructurePackage } from "CreepGroups/InfrastructureGroup";
import { OSPackage as TempBranchPackage } from "CreepGroups/TempBranch";

export const CreepGroupsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        //TempAgencyPackage.install(processRegistry, extensionRegistry);

        ControlGroupPackage.install(processRegistry, extensionRegistry);
        ExtractionGroupPackage.install(processRegistry, extensionRegistry);
        InfrastructurePackage.install(processRegistry, extensionRegistry);
        TempBranchPackage.install(processRegistry, extensionRegistry);
    }
}