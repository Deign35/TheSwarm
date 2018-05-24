export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Harvester, HarvesterJob);
    }
}

import { BasicJob } from "./BasicJob";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";

class HarvesterJob extends BasicJob<HarvesterJob_Memory> {
    protected GetActionType(): ActionType {
        return AT_Harvest;
    }
    CheckIsTargetStillValid(): boolean {
        return !!Game.getObjectById(this.memory.t);
    }

    protected RunState_Preparing(): ThreadState {
        if (!this.creep) {
            // if not, kill the child process and start over
            if (this.memory.a) {
                this.kernel.killProcess(this.memory.a, `KillProcess (HarvesterJob.RunState_Preparing())`);
                delete this.memory.a;
            }
            delete this.memory.c;
            this.JobState = JobState_Inactive;
            return ThreadState_Done;
        }
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
        if (target && !target.pos.isEqualTo(this.creep.pos)) {
            new MoveToPositionAction(this.creep, target.pos).Run();
            return ThreadState_Done;
        }
        this.JobState = JobState_Running;
        return ThreadState_Active;
    }
    protected RunState_Running(): ThreadState {
        if (!this.creep) {
            // if not, kill the child process and start over
            if (this.memory.a) {
                this.kernel.killProcess(this.memory.a, `KillProcess (HarvesterJob.RunState_Running())`);
                delete this.memory.a;
            }
            delete this.memory.c;
            this.JobState = JobState_Starting;
            return ThreadState_Active;
        }

        if (this.memory.a) {
            // Double check that the process still exists
            if (this.kernel.getProcessByPID(this.memory.a)) {
                //this.sleeper.sleep(this.pid, this.creep.ticksToLive! - 3);
                return ThreadState_Done;
            } else {
                delete this.memory.a;
            }
        }
        let startCreepMemory: CreepThread_JobMemory = {
            c: this.memory.c,
            a: this.GetActionType(),
            l: this.memory.l,
            t: this.memory.t
        }

        this.memory.a = this.kernel.startProcess(PKG_CreepThread, startCreepMemory);
        this.creepRegistry.releaseCreep(this.memory.c);
        this.creepRegistry.tryReserveCreep(this.memory.c, this.memory.a);
        this.kernel.setParent(this.memory.a, this.pid);
        return ThreadState_Done;
    }
}