export const OSPackage: IPackage<SpawnerExtension_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
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
    /*
    protected get SpawnPriority(): Priority {
        return Priority_Low;
    }
    protected get SpawnBody() {
        let spawnCap = Game.rooms[this.memory.loc].energyCapacityAvailable;
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
    */
    protected activateCreep(creep: Creep): void {
        if (this.memory.en) {
            if (this.creep.carry.energy == this.creep.carryCapacity) {
                this.memory.tar = undefined;
                this.memory.en = false;
            } else {
                return;
            }
        } else if (this.creep.carry.energy == 0) {
            this.memory.tar = undefined;
            this.memory.en = true;
            this.getEnergy(this.creep.carryCapacity / 2);
            return;
        }

        if (this.memory.tar && creep.room.name != this.memory.loc) {
            new MoveToPositionAction(creep, new RoomPosition(25, 25, this.memory.loc)).Run();
            return;
        }

        let targetSite = Game.constructionSites[this.memory.tar!];
        if (!targetSite) {
            this.memory.tar = undefined;
            let roomData = this.RoomView.GetRoomData(this.creep.room.name);
            if (!roomData) {
                // This should never happen
                this.log.fatal(`Roomdata missing`);
                this.kernel.killProcess(this.pid);
                return;
            }
            
            let keys = Object.keys(roomData.cSites);
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
                this.memory.tar = targetSite.id;
            }
        }

        if (targetSite) {
            new BuildAction(this.creep, targetSite).Run();
        }
    }
}