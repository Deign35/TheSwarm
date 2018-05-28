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
        if (viewData.cSites.length == 0) {
            if (this.assignments['Build']) {
                this.CloseAssignment('Build');
            }
            this.EnsureAssignment('Repair', CT_Repair, spawnCap >= CreepBodies.Repair[1].cost ? 1 : 0, Priority_Lowest, CJ_Repair, TT_Repair);
        } else {
            if (this.assignments['Repair']) {
                this.CloseAssignment('Repair');
            }
            this.EnsureAssignment('Build', CT_Worker, spawnCap >= CreepBodies.Worker[1].cost ? 1 : 0, Priority_Low, CJ_Build, TT_Builder);
        }
    }
}