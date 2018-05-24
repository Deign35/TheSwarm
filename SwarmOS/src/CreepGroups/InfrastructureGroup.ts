import { ExtensionBase } from "Core/BasicTypes";
import { BasicCreepGroup } from "CreepGroups/BasicCreepGroup";

export const OSPackage: IPackage<InfrastructureGroup_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Infrastructure, InfrastructureGroup);
    }
}

class InfrastructureGroup extends BasicCreepGroup<InfrastructureGroup_Memory> {
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
            this.EnsureAssignment('Builder1', CT_Builder, buildLevel, Priority_Low, CJ_Build);
            let curState1 = this.GetAssignmentState('Builder1');
            switch (curState1) {
                case (JobState_Inactive):
                    this.SetAssignmentTarget('Builder1', Game.getObjectById(viewData.cSites[0]) as ConstructionSite);
                    this.StartAssignmentIfInactive('Builder1');
                default:
                    break;
            }
            if (viewData.cSites.length > 3) {
                this.EnsureAssignment('Builder2', CT_Builder, buildLevel, Priority_Medium, CJ_Build);
                let curState2 = this.GetAssignmentState('Builder2');
                switch (curState2) {
                    case (JobState_Inactive):
                        this.SetAssignmentTarget('Builder2', Game.getObjectById(viewData.cSites[1]) as ConstructionSite);
                        this.StartAssignmentIfInactive('Builder2');
                    default:
                        break;
                }
                if (viewData.cSites.length > 7) {
                    this.EnsureAssignment('Builder3', CT_Builder, buildLevel, Priority_Lowest, CJ_Build);
                    let curState3 = this.GetAssignmentState('Builder3');
                    switch (curState3) {
                        case (JobState_Inactive):
                            this.SetAssignmentTarget('Builder3', Game.getObjectById(viewData.cSites[2]) as ConstructionSite);
                            this.StartAssignmentIfInactive('Builder3');
                        default:
                            break;
                    }
                    if (viewData.cSites.length > 10) {
                        this.EnsureAssignment('Builder4', CT_Builder, buildLevel, Priority_Lowest, CJ_Build);
                        let curState4 = this.GetAssignmentState('Builder4');
                        switch (curState4) {
                            case (JobState_Inactive):
                                this.SetAssignmentTarget('Builder4', Game.getObjectById(viewData.cSites[2]) as ConstructionSite);
                                this.StartAssignmentIfInactive('Builder4');
                            default:
                                break;
                        }
                    }
                }
            }
        }
    }

    protected get GroupPrefix(): string { return 'INF'; }
}