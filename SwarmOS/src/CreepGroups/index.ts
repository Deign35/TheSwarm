/*import { OSPackage as BuilderPackage } from "CreepGroups/BuilderGroup";
import { OSPackage as HarvesterPackage } from "CreepGroups/HarvesterGroup";
import { OSPackage as RefillerPackage } from "CreepGroups/RefillerGroup";
import { OSPackage as UpgraderPackage } from "CreepGroups/UpgraderGroup";*/

import { OSPackage as TempAgencyPackage } from "CreepGroups/TempAgency";

export const CreepGroupsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        TempAgencyPackage.install(processRegistry, extensionRegistry);
        /*BuilderPackage.install(processRegistry, extensionRegistry);
        HarvesterPackage.install(processRegistry, extensionRegistry);
        RefillerPackage.install(processRegistry, extensionRegistry);
        UpgraderPackage.install(processRegistry, extensionRegistry);*/
    }
}