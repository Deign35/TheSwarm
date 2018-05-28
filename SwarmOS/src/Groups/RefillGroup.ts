export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Refill, RefillGroup);
    }
}

import { BasicCreepGroup } from "Jobs/BasicCreepGroup";

class RefillGroup extends BasicCreepGroup<SourceGroup_Memory> {
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

        if (isMyRoom) {
            if (targetRoom.controller!.level <= 3) {
                this.EnsureAssignment('EMRefiller', CT_Worker, 0, Priority_Highest, CJ_Refiller, TT_SpawnRefill);
            }

            this.EnsureAssignment('Spawnfiller', CT_SlowHauler, spawnCap > CreepBodies.SlowHauler[1].cost ? 1 : 0, Priority_High, CJ_Refiller, TT_SpawnRefill);
        }
    }
}