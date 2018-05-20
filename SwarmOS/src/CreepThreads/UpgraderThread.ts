export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepUpgrader, Upgrader);
    }
}

import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";
import { CreepThread } from "./CreepThread";

export class Upgrader extends CreepThread<Upgrader_Memory> {
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

        let target = this.creep.room.controller!;
        if (!target) {
            this.log.fatal(`Target is missing`);
            this.kernel.killProcess(this.pid);
            return ThreadState_Done;
        }

        let action: ActionBase = new UpgradeAction(this.creep, target);
        switch (action.ValidateAction()) {
            case (SR_NONE):
            case (SR_MOVE):
                break;
            case (SR_REQUIRES_ENERGY):
                this.memory.get = true;
                this.memory.tar = undefined;
                return ThreadState_Done;
            default:
                this.log.warn(`Unhandled action validation error: ${action.ValidateAction()}`);
                break;
        }

        // Do something to confirm whether or not this creep should move and make space for other creeps
        action.Run();
        return ThreadState_Done
    }
}