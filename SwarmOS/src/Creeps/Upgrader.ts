export const bundle: IPosisBundle<SpawnData_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(PKG_CreepUpgrader, Upgrader);
    },
    rootImageName: PKG_CreepUpgrader
}

import { CreepBase } from "Creeps/CreepBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";

export class Upgrader extends CreepBase<Upgrader_Memory> {
    protected get CreepPrefix() { return 'Upg_'; }
    protected get SpawnPriority() {
        return Priority.Lowest;
    }
    protected activateCreep(): void {
        let creep = Game.creeps[this.memory.creep!];
        if (!creep) {
            // This should never happen
            this.log.fatal(`Creep activation occurred without an assigned creep`);
            this.memory.creep = undefined;
            return;
        }
        if (creep.spawning) {
            return;
        }

        if (!creep.room.controller) {
            this.log.fatal(`Target is missing`);
            this.kernel.killProcess(this.pid);
            return;
        }

        if (this.memory.retrieving) {
            if (this.creep.carry.energy == this.creep.carryCapacity) {
                this.memory.targetID = undefined;
                this.memory.retrieving = false;
                //this.memory.targetRoom = this.
            } else {
                this.getEnergy(this.creep.carryCapacity / 2);
                return;
            }
        } else if (this.creep.carry.energy == 0) {
            this.memory.targetID = undefined;
            this.memory.retrieving = true;
            this.getEnergy(this.creep.carryCapacity / 2);
            return;
        }

        if (creep.room.name != this.memory.targetRoom) {
            new MoveToPositionAction(creep, new RoomPosition(25, 25, this.memory.targetRoom)).Run();
            return;
        }

        let target = creep.room.controller;
        let action: ActionBase = new UpgradeAction(creep, target);
        switch (action.ValidateAction()) {
            case (SR_NONE):
            case (SR_MOVE):
                break;
            case (SR_REQUIRES_ENERGY): // (TODO): Implement refilling Upgrader's resources somehow.
                break;
        }

        // Do something to confirm whether or not this creep should move and make space for other creeps
        action.Run();
    }
}