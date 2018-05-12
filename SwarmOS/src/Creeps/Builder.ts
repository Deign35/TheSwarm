export const bundle: IPosisBundle<SpawnData_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(PKG_CreepBuilder, Builder);
    },
    rootImageName: PKG_CreepBuilder
}

import { CreepBase } from "Creeps/CreepBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";
import { BuildAction } from "Actions/BuildAction";

export class Builder extends CreepBase<Builder_memory> {
    protected get CreepPrefix() { return 'Bui_'; }
    protected get SpawnPriority() {
        return Priority.Low;
    }
    protected get SpawnBody() {
        let spawnCap = Game.rooms[this.memory.targetRoom].energyCapacityAvailable;
        if (spawnCap >= 2000) {
            return {
                body: [WORK, WORK, WORK, WORK, WORK,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE],
                cost: 2000
            }
        } else if (spawnCap >= 1200) {
            return {
                body: [WORK, WORK,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE],
                cost: 1200
            }
        } else if (spawnCap >= 600) {
            return {
                body: [WORK,
                    CARRY, CARRY, CARRY, CARRY, CARRY,
                    MOVE, MOVE, MOVE, MOVE, MOVE],
                cost: 600
            }
        } else if (spawnCap >= 450) {
            return {
                body: [WORK, WORK,
                    CARRY, CARRY,
                    MOVE, MOVE, MOVE],
                cost: 450
            }
        }
        return {
            body: [WORK, CARRY, CARRY, MOVE],
            cost: 250
        }
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

        let targetSite = Game.constructionSites[this.memory.targetID!];
        if (!targetSite) {
            let keys = Object.keys(Game.constructionSites);
            let dist = 100;
            for (let i = 0; i < keys.length; i++) {
                let nextSite = Game.constructionSites[keys[i]];
                let siteDist = this.creep.pos.getRangeTo(nextSite);
                if (siteDist < dist) {
                    targetSite = nextSite;
                    dist = siteDist;
                }
            }

            if (targetSite) {
                this.memory.targetID = targetSite.id;
            }
        }

        if (targetSite) {
            new BuildAction(this.creep, targetSite).Run();
        }
    }
}