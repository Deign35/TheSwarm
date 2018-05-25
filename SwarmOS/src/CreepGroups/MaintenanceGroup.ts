import { ExtensionBase } from "Core/BasicTypes";
import { BasicCreepGroup } from "CreepGroups/BasicCreepGroup";

export const OSPackage: IPackage<InfrastructureGroup_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Maintenance, MaintenanceGroup);
    }
}

class MaintenanceGroup extends BasicCreepGroup<MaintenanceGroup_Memory> {
    protected GetNewTarget(assignmentID: string): string {
        if (this.repairQueue.length > 0) {
            return this.repairQueue.shift()!;
        }

        return '';
    }
    protected get repairQueue() {
        return this.memory.repairQueue;
    }
    protected EnsureGroupFormation(): void {
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;

        let spawnRoom = Game.rooms[this.memory.homeRoom];
        if (viewData.owner && viewData.owner == MY_USERNAME) {
            spawnRoom = Game.rooms[this.memory.targetRoom];
        }

        let repairLevel = 0;
        if (spawnRoom.energyCapacityAvailable >= CreepBodies.Repair[1].cost) { // 1150
            repairLevel = 1;
        }
        if (this.repairQueue.length == 0) {
            let targetRoom = Game.rooms[this.memory.targetRoom];
            if (targetRoom) {
                let structs = targetRoom.find(FIND_STRUCTURES);
                for (let i = 0; i < structs.length; i++) {
                    if (structs[i].hits < structs[i].hitsMax) {
                        this.repairQueue.push(structs[i].id);
                    }
                }
            }

            if (this.repairQueue.length == 0) {
                // (TODO): Update this to a much longer sleep timer.
                this.sleeper.sleep(this.pid, 20);
            }
        }
        if (this.repairQueue.length > 0) {
            this.EnsureAssignment('Repair', CT_Repair, repairLevel, Priority_Low, CJ_Repair, TT_Repair);
        }
    }
}