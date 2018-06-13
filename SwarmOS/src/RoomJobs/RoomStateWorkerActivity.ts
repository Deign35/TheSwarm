export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(RJ_WorkTarget, RoomStateWorkerTargetActivity);
    }
}
import { RoomStateActivity } from "RoomJobs/RoomStateActivities";

class RoomStateWorkerTargetActivity extends RoomStateActivity<RoomStateActivity_Memory> {
    PrepTick() {
        super.PrepTick();
        if (this.roomData.targets.Other.t == TT_Controller) {
            this.roomData.targets.Other.en = 0;
        }

        if (this.room && this.roomData.owner == MY_USERNAME) {
            if (this.room.controller!.ticksToDowngrade < 2000) {
                this.roomData.targets.Other = {
                    target: this.room.controller!.id,
                    at: AT_Upgrade,
                    t: TT_Controller,
                    en: 200
                }
            }
        }
        if (this.room) {
            if (this.shouldRefresh(27, this.roomData.minUpdateOffset, this.memory.lu)) {
                this.roomData.cSites = this.room.find(FIND_CONSTRUCTION_SITES).map((value: ConstructionSite) => {
                    return value.id;
                });
            }
        }
    }

    RunThread(): ThreadState {
        if (!this.room) {
            return ThreadState_Done;
        }
        let curTarget = Game.getObjectById(this.roomData.targets.Other.target);
        if (curTarget && this.roomData.targets.Other.en > 0 && this.roomData.targets.Other.t != TT_None &&
            this.roomData.targets.Other.at != AT_NoOp) {
            return ThreadState_Waiting;
        }
        if (!curTarget) {
            this.roomData.targets.Other = {
                target: '',
                at: AT_NoOp,
                t: TT_None,
                en: 0
            }
        }

        let nextTarget;
        if (this.roomData.targets.Other.t != TT_AnyStructure) {
            while (this.roomData.needsRepair.length > 0) {
                nextTarget = Game.getObjectById<Structure>(this.roomData.needsRepair.splice(0, 1)![0]);
                if (nextTarget && nextTarget != curTarget) {
                    this.roomData.targets.Other = {
                        t: TT_AnyStructure,
                        at: AT_Repair,
                        target: nextTarget.id,
                        en: Math.ceil((nextTarget.hitsMax - nextTarget.hits) * REPAIR_COST)
                    }
                    return ThreadState_Waiting;
                }
            }
        }

        if (!nextTarget && this.roomData.targets.Other.t != TT_ConstructionSite && this.roomData.cSites.length > 0) {
            let siteToBuild: ConstructionSite | undefined = undefined;
            // (TODO): Prioritize here.
            for (let i = 0; i < this.roomData.cSites.length; i++) {
                let site = Game.getObjectById<ConstructionSite>(this.roomData.cSites[i]);
                if (site && site != curTarget) {
                    if (!siteToBuild) {
                        siteToBuild = site;
                    }
                }
            }

            if (siteToBuild) {
                this.roomData.targets.Other = {
                    target: siteToBuild.id,
                    at: AT_Build,
                    t: TT_ConstructionSite,
                    en: Math.ceil((siteToBuild.progressTotal - siteToBuild.progress) / BUILD_POWER)
                }
                nextTarget = siteToBuild;
                return ThreadState_Waiting;
            }
        }

        if (this.roomData.owner == MY_USERNAME) {
            this.roomData.targets.Other = {
                target: this.room.controller!.id,
                at: AT_Upgrade,
                t: TT_Controller,
                en: 200
            }
            return ThreadState_Waiting;
        }

        this.roomData.targets.Other = {
            target: '',
            at: AT_NoOp,
            t: TT_None,
            en: 0
        }
        return ThreadState_Done;
    }
}