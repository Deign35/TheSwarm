import { OSPackage as TempAgencyPackage } from "CreepGroups/TempAgency";
import { OSPackage as ExtractionGroupPackage } from "CreepGroups/ExtractionGroup";

export const CreepGroupsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        TempAgencyPackage.install(processRegistry, extensionRegistry);

        ExtractionGroupPackage.install(processRegistry, extensionRegistry);
    }
}