export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepRepair, RepairThread);
    }
}

import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";
import { BuildAction } from "Actions/BuildAction";
import { CreepThread } from "CreepThreads/CreepThread";

export class RepairThread extends CreepThread<Builder_Memory> {
    RunThread(): ThreadState {
        if (!this.creep || this.creep.spawning) {
            return ThreadState_Done;
        }

        if (this.memory.get) {
            if (this.creep.carry.energy == this.creep.carryCapacity) {
                this.memory.tar = undefined;
                this.memory.get = false;
            }
        } else if (this.creep.carry.energy == 0) {
            this.memory.tar = undefined;
            this.memory.get = true;
        }

        let targetRoom = (this.memory.get ? this.memory.home : this.memory.loc);
        if (this.creep.room.name != targetRoom) {
            new MoveToPositionAction(this.creep, new RoomPosition(25, 25, targetRoom)).Run();
        }

        if (this.memory.get) {
            return this.getEnergy(this.creep.carryCapacity / 2);
        }

        if (!this.memory.tar) {
            // Find a thing to repair or release the creep to get a new job.
        }
        return ThreadState_Done;
    }
}