import { ExtensionBase } from "Core/BasicTypes";
import { BasicCreepGroup } from "CreepGroups/BasicCreepGroup";

export const OSPackage: IPackage<InfrastructureGroup_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Infrastructure, InfrastructureGroup);
    }
}

class InfrastructureGroup extends BasicCreepGroup<InfrastructureGroup_Memory> {
    protected GetNewTarget(assignmentID: string): string {
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;
        if (viewData.cSites.length > 0) {
            return viewData.cSites[0];
        }

        return '';
    }
    protected EnsureGroupFormation(): void {
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;

        let spawnRoom = Game.rooms[this.memory.homeRoom];
        if (viewData.owner && viewData.owner == MY_USERNAME) {
            spawnRoom = Game.rooms[this.memory.targetRoom];
        }

        let buildLevel = 0;
        if (spawnRoom.energyCapacityAvailable >= 1700) {
            buildLevel = 3;
        } else if (spawnRoom.energyCapacityAvailable >= 1050) {
            buildLevel = 2;
        } else if (spawnRoom.energyCapacityAvailable >= 550) {
            buildLevel = 1;
        }
        if (viewData.cSites.length > 0) {
            this.EnsureAssignment('Builder1', CT_Builder, buildLevel, Priority_Low, CJ_Build, TT_Builder);
            if (viewData.cSites.length > 3) {
                this.EnsureAssignment('Builder2', CT_Builder, buildLevel, Priority_Medium, CJ_Build, TT_Builder);
                if (viewData.cSites.length > 7) {
                    this.EnsureAssignment('Builder3', CT_Builder, buildLevel, Priority_Lowest, CJ_Build, TT_Builder);
                    if (viewData.cSites.length > 10) {
                        this.EnsureAssignment('Builder4', CT_Builder, buildLevel, Priority_Lowest, CJ_Build, TT_Builder);
                    }
                }
            }
        }
    }
}