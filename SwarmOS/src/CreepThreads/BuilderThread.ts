export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepBuilder, BuilderThread);
    }
}

import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";
import { BuildAction } from "Actions/BuildAction";
import { CreepThread } from "CreepThreads/CreepThread";

export class BuilderThread extends CreepThread<Builder_Memory> {
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

        let targetSite = Game.constructionSites[this.memory.tar!];
        if (!targetSite) {
            this.memory.tar = undefined;
            let roomData = this.RoomView.GetRoomData(this.creep.room.name);
            if (!roomData) {
                // This should never happen
                this.log.fatal(`Roomdata missing`);
                this.kernel.killProcess(this.pid);
                return ThreadState_Done;
            }

            let dist = 100;
            for (let i = 0; i < roomData.cSites.length; i++) {
                let nextSite = Game.constructionSites[roomData.cSites[i]];
                let siteDist = this.creep.pos.getRangeTo(nextSite);
                if (siteDist < dist) {
                    targetSite = nextSite;
                    dist = siteDist;
                }
            }

            if (targetSite) {
                this.memory.tar = targetSite.id;
            } else {
                this.creepRegistry.releaseCreep(this.creep.name);
                // (TODO): THIS IS BAD.  Unmanaged creep drop.
                this.kernel.killProcess(this.pid);
                return ThreadState_Done;
            }
        }

        if (targetSite) {
            new BuildAction(this.creep, targetSite).Run();
        }
        return ThreadState_Done;
    }
}