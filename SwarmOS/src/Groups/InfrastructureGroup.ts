export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Infrastructure, InfrastructureGroup);
    }
}
import { BasicCreepGroup } from "Jobs/BasicCreepGroup";

class InfrastructureGroup extends BasicCreepGroup<SourceGroup_Memory> {
    protected EnsureGroupFormation(): void {
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;
        let targetRoom = Game.rooms[this.memory.targetRoom];
        let isMyRoom = viewData.owner && viewData.owner == MY_USERNAME;
        let spawnCap = 300;

        if (!viewData.owner) {
            let room = Game.rooms[this.memory.homeRoom];
            spawnCap = room.energyCapacityAvailable;
        } else {
            spawnCap = targetRoom.energyCapacityAvailable;
        }
        this.EnsureAssignment('Repair', CT_Repair, spawnCap >= CreepBodies.Repair[1].cost ? 1 : 0, Priority_Lowest, CJ_Repair, TT_Repair);
        if (viewData.cSites.length > 0) {
            if (!targetRoom.controller) {
                this.EnsureAssignment('Build', CT_Worker, spawnCap >= CreepBodies.Worker[1].cost ? 1 : 0, Priority_Low, CJ_Build, TT_Builder);
            } else {
                if (targetRoom.controller.level < 4) {
                    this.EnsureAssignment('Build', CT_Worker, spawnCap >= CreepBodies.Worker[1].cost ? 1 : 0, Priority_Low, CJ_Build, TT_Builder);
                    this.EnsureAssignment('Build2', CT_Worker, spawnCap >= CreepBodies.Worker[1].cost ? 1 : 0, Priority_Low, CJ_Build, TT_Builder);
                    this.EnsureAssignment('Build3', CT_Worker, spawnCap >= CreepBodies.Worker[1].cost ? 1 : 0, Priority_Low, CJ_Build, TT_Builder);
                } else {
                    this.EnsureAssignment('Build', CT_Worker, spawnCap >= CreepBodies.Worker[3].cost ? 3 : 2, Priority_Low, CJ_Build, TT_Builder);
                    if (viewData.sourceIDs.length > 1) {
                        this.EnsureAssignment('Build2', CT_Worker, spawnCap >= CreepBodies.Worker[3].cost ? 3 : 2, Priority_Low, CJ_Build, TT_Builder);
                    }
                }
            }
        } else {
            if (this.assignments['Build']) {
                this.CloseAssignment('Build');
                delete this.assignments['Build'];
                if (this.assignments['Build2']) {
                    this.CloseAssignment('Build2');
                    delete this.assignments['Build2'];
                }
                if (this.assignments['Build3']) {
                    this.CloseAssignment('Build3');
                    delete this.assignments['Build3'];
                }
            }
        }
    }
}