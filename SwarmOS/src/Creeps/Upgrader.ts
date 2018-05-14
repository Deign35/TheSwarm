export const bundle: IPackage<SpawnerExtension_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
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
    protected get SpawnBody() {
        let spawnCap = Game.rooms[this.memory.loc].energyCapacityAvailable;
        let level = Game.rooms[this.memory.loc].controller!.level;
        switch (level) {
            case (8):
                if (spawnCap >= 200) {
                    return {
                        body: [WORK, CARRY, MOVE],
                        cost: 200
                    }
                }
            case (7):
            case (6):
            case (5):
                if (spawnCap >= 1600) {
                    return {
                        body: [WORK, WORK, WORK, WORK, WORK,
                            CARRY, CARRY, CARRY, CARRY, CARRY,
                            CARRY, CARRY, CARRY, CARRY, CARRY,
                            MOVE, MOVE, MOVE, MOVE, MOVE,
                            MOVE, MOVE, MOVE, MOVE, MOVE],
                        cost: 1600
                    }
                }
            case (4):
                if (spawnCap >= 1200) {
                    return {
                        body: [WORK, WORK, WORK, WORK,
                            CARRY, CARRY, CARRY, CARRY,
                            CARRY, CARRY, CARRY, CARRY,
                            MOVE, MOVE, MOVE, MOVE,
                            MOVE, MOVE, MOVE, MOVE],
                        cost: 1200
                    }
                }
            case (3):
                if (spawnCap >= 800) {
                    return {
                        body: [WORK, WORK, WORK,
                            CARRY, CARRY, CARRY, CARRY, CARRY,
                            MOVE, MOVE, MOVE, MOVE, MOVE],
                        cost: 800
                    }
                }
            case (2):
                if (spawnCap >= 400) {
                    return {
                        body: [WORK, CARRY, CARRY, CARRY, MOVE, MOVE],
                        cost: 400
                    }
                }
            case (1):
            default:
                return {
                    body: [WORK, CARRY, MOVE],
                    cost: 200
                }
        }
    }
    protected get SpawnPriority() {
        if (Game.rooms[this.memory.loc].controller!.ticksToDowngrade < 3000) {
            return Priority_EMERGENCY;
        }
        return Priority_Lowest;
    }
    protected activateCreep(): void {
        let creep = Game.creeps[this.memory.CC!];
        if (!creep) {
            // This should never happen
            this.log.fatal(`Creep activation occurred without an assigned creep`);
            this.memory.CC = undefined;
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

        if (this.memory.en) {
            if (this.creep.carry.energy == this.creep.carryCapacity) {
                this.memory.tar = undefined;
                this.memory.en = false;
                //this.memory.targetRoom = this.
            } else {
                this.getEnergy(this.creep.carryCapacity / 2);
                return;
            }
        } else if (this.creep.carry.energy == 0) {
            this.memory.tar = undefined;
            this.memory.en = true;
            this.getEnergy(this.creep.carryCapacity / 2);
            return;
        }

        if (creep.room.name != this.memory.loc) {
            new MoveToPositionAction(creep, new RoomPosition(25, 25, this.memory.loc)).Run();
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