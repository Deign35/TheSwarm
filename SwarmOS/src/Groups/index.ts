import { OSPackage as ControlGroup } from "Groups/ControlGroup";
import { OSPackage as InfrastructureGroup } from "Groups/InfrastructureGroup";
import { OSPackage as RefillGroup } from "Groups/RefillGroup";
import { OSPackage as SelfDefenseGroup } from "Groups/SelfDefenseGroup";
import { OSPackage as SourceGroup } from "Groups/SourceGroup";

export const CreepGroupsPackage: IPackage<{}> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        ControlGroup.install(processRegistry, extensionRegistry);
        InfrastructureGroup.install(processRegistry, extensionRegistry);
        RefillGroup.install(processRegistry, extensionRegistry);
        SelfDefenseGroup.install(processRegistry, extensionRegistry);
        SourceGroup.install(processRegistry, extensionRegistry);
    }
}