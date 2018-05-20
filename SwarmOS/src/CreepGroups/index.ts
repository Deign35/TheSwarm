//import { OSPackage as TempAgencyPackage } from "CreepGroups/TempAgency";
import { OSPackage as ExtractionGroupPackage } from "CreepGroups/ExtractionGroup";
import { OSPackage as ControlGroupPackage } from "CreepGroups/ControlGroup";
import { OSPackage as TempBranchPackage } from "CreepGroups/TempBranch";

export const CreepGroupsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        //TempAgencyPackage.install(processRegistry, extensionRegistry);

        ExtractionGroupPackage.install(processRegistry, extensionRegistry);
        ControlGroupPackage.install(processRegistry, extensionRegistry);
        TempBranchPackage.install(processRegistry, extensionRegistry);
    }
}