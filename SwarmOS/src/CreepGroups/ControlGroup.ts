import { BasicCreepGroup } from "./BasicCreepGroup";

export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Control, ControlGroup);
    }
}

class ControlGroup extends BasicCreepGroup<ControlGroup_Memory> {
    protected GetNewTarget(assignmentID: string): string {
        return Game.rooms[this.memory.homeRoom].controller!.id;
    }
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

        if (needsClaimer) {
            this.log.warn(`Claimer functionality unset`);
            return;
        }

        let level = 0;
        if (spawnRoom.energyCapacityAvailable >= 1500) {
            level = 3;
        } else if (spawnRoom.energyCapacityAvailable >= 700) {
            level = 2;
        } else if (spawnRoom.energyCapacityAvailable >= 500) {
            level = 1;
        }

        this.EnsureAssignment('Upgrader', CT_Upgrader, level, Priority_Low, CJ_Upgrade);
    }
}