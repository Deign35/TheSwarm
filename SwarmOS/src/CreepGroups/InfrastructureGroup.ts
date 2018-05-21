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
        let needsClaimer = !viewData.owner;
        if (viewData.owner) {
            if (viewData.owner != MY_USERNAME) {
                return;
            } else {
                spawnRoom = Game.rooms[this.memory.targetRoom];
            }
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
            this.EnsureAssignment('Builder_1', CT_Builder, buildLevel, {
                pri: Priority_Low,
                res: false
            });
            if (viewData.cSites.length > 3) {
                this.EnsureAssignment('Builder_2', CT_Builder, buildLevel, {
                    pri: Priority_Medium,
                    res: false
                });
                if (viewData.cSites.length > 7) {
                    this.EnsureAssignment('Builder_3', CT_Builder, buildLevel, {
                        pri: Priority_Low,
                        res: false
                    })
                }
            }
        }
    }

    protected get GroupPrefix(): string { return 'INF'; }
}