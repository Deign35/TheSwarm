export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Harvester, HarvesterJob);
    }
}

import { BasicJob } from "./BasicJob";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { HarvestAction } from "Actions/HarvestAction";

class HarvesterJob extends BasicJob<HarvesterJob_Memory> {
    protected GetActionType(): ActionType {
        return AT_Harvest;
    }
    CheckIsTargetStillValid(): boolean {
        return !!Game.getObjectById(this.memory.t);
    }

    protected RunState_Preparing(): ThreadState {
        let target: Source | StructureContainer | ConstructionSite | undefined = Game.getObjectById(this.memory.t) as Source;
        if (!target) {
            this.JobState = JobState_Inactive;
            return ThreadState_Done;
        }
        if (!this.memory.cont) {
            let containers = target.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: function (struct: Structure) {
                    return struct.structureType == STRUCTURE_CONTAINER;
                }
            });
            if (containers.length > 0) {
                this.memory.cont = containers[0].id;
            } else if (!this.memory.cont) {
                let sites = target.pos.findInRange(FIND_CONSTRUCTION_SITES, 1);
                for (let i = 0; i < sites.length; i++) {
                    if (sites[i].structureType == STRUCTURE_CONTAINER) {
                        this.memory.cont = sites[i].id;
                    }
                }
                if (!this.memory.cont) {
                    target.pos.findInRange(FIND_FLAGS, 1);
                    // define what flags do damn it...
                    this.log.warn(`No constructionSite exists.  Harvester unable to see flags.`);
                    this.JobState = JobState_Running;
                    return ThreadState_Active;
                }
            }
        }

        if (this.memory.cont) {
            target = Game.getObjectById(this.memory.cont) as StructureContainer | ConstructionSite;
            if (!target) {
                delete this.memory.cont;
            }
        }
        // (TODO): If there happens to be a creep that ends up standing on the container, the harvester will not stand on it anymore.
        if (target && !target.pos.isEqualTo(this.creep.pos) && target.pos.lookFor(LOOK_CREEPS).length == 0) {
            new MoveToPositionAction(this.creep, target.pos).Run();
            return ThreadState_Done;
        }
        this.JobState = JobState_Running;
        return ThreadState_Active;
    }
    protected RunState_Running(): ThreadState {
        let action = new HarvestAction(this.creep, Game.getObjectById(this.memory.t) as Source);

        if (action) {
            action.Run();
        } else {
            this.log.warn(`UNEXPECTED--Action not working3`);
        }
        return ThreadState_Done;
    }
}