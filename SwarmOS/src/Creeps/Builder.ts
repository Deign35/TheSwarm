export const OSPackage: IPackage<SpawnerExtension_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepBuilder, Builder);
    }
}

import { CreepBase } from "Creeps/CreepBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";
import { BuildAction } from "Actions/BuildAction";

export class Builder extends CreepBase<Builder_memory> {
    protected get SpawnPriority(): Priority {
        return Priority_Low;
    }

    protected get CreepPrefix() { return 'Bui_'; }
    protected activateCreep(): void {
        if (this.memory.get) {
            if (this.creep.carry.energy == this.creep.carryCapacity) {
                this.memory.tar = undefined;
                this.memory.get = false;
            } else {
                this.getEnergy(this.creep.carryCapacity / 2);
                return;
            }
        } else if (this.creep.carry.energy == 0) {
            this.memory.tar = undefined;
            this.memory.get = true;
            this.getEnergy(this.creep.carryCapacity / 2);
            return;
        }

        if (this.memory.tar && this.creep.room.name != this.memory.loc) {
            new MoveToPositionAction(this.creep, new RoomPosition(25, 25, this.memory.loc)).Run();
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

            let dist = 100;
            for (let i = 0; i < roomData.cSites.length; i++) {
                let nextSite = Game.constructionSites[roomData.cSites[i].id];
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