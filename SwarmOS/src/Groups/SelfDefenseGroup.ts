export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_SelfDefense, SelfDefenseGroup);
    }
}
import { BasicCreepGroup } from "Groups/BasicCreepGroup";

class SelfDefenseGroup extends BasicCreepGroup<SelfDefenseGroup_Memory> {
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
        //this.EnsureAssignment('Defender', CT_Repair, spawnCap >= CreepBodies.Repair[1].cost ? 1 : 0, Priority_Lowest, CJ_Repair, TT_Repair);
        //this.EnsureAssignment('WallBuilder', CT_Repair, spawnCap >= CreepBodies.Repair[1].cost ? 1 : 0, Priority_Lowest, CJ_Repair, TT_WallBuilder);

        let hostiles = targetRoom ? targetRoom.find(FIND_HOSTILE_CREEPS) : [];
        if (hostiles.length > 0) {
            if (viewData.structures.tower) {
                for (let i = 0; i < viewData.structures.tower.length; i++) {
                    let tower = Game.getObjectById(viewData.structures.tower[i]) as StructureTower;
                    if (tower) {
                        tower.attack(hostiles[0]);
                    }
                }
            }
        } else {
            this.sleeper.sleep(this.pid, 10);
        }
    }
}