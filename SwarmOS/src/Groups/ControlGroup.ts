export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Control, ControlGroup);
    }
}
import { BasicCreepGroup } from "Jobs/BasicCreepGroup";

class ControlGroup extends BasicCreepGroup<ControlGroup_Memory> {
    protected EnsureGroupFormation(): void {
        // (TODO): Add a road from the spawn to the controller
        let viewData = this.View.GetRoomData(this.memory.targetRoom)!;
        let targetRoom = Game.rooms[this.memory.targetRoom];
        let isMyRoom = viewData.owner && viewData.owner == MY_USERNAME;
        let spawnCap = 300;

        if (!viewData.owner || !targetRoom.controller) {
            throw new Error(`ControlGroup attached to a room that is not under control`)
        } else {
            spawnCap = targetRoom.energyCapacityAvailable;
        }

        if (targetRoom.controller.ticksToDowngrade < 3000) {
            this.EnsureAssignment('EMUpgrader', CT_Worker, 0, Priority_EMERGENCY, CJ_Upgrade, TT_Upgrader, targetRoom.controller.id);
        }

        if (viewData.cSites.length == 0) {
            let numUpgraders = 0;
            let bodyLevel = 0;

            switch (targetRoom.controller.level) {
                case (8):
                    numUpgraders = 1;
                    bodyLevel = 0;
                    break;
                case (7):
                case (6):
                case (5):
                case (4):
                case (3):
                case (2):
                    numUpgraders = 2 * viewData.sourceIDs.length;
                    for (let i = CreepBodies.Worker.length - 1; i >= 0; i--) {
                        if (spawnCap > CreepBodies.Worker[i].cost) {
                            bodyLevel = i;
                            break;
                        }
                    }
                    break;
                case (1):
                    numUpgraders = 1;
                    break;
                case (0):
                default:
                    throw new Error(`ControlGroup attached to an invalid room RCL(${targetRoom.controller.level})`);
            }

            for (let i = 0; i < numUpgraders; i++) {
                this.EnsureUpgrader('Up' + i, bodyLevel);
            }
        }

        this.sleeper.sleep(this.pid, 20);
    }

    protected EnsureUpgrader(id: string, level: number) {
        this.EnsureAssignment(id, CT_Worker, level, Priority_Lowest, CJ_Upgrade, TT_Upgrader, this.memory.targetRoom)
    }
}