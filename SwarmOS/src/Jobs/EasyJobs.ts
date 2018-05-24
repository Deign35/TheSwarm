export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Build, BuildJob);
        processRegistry.register(CJ_Refiller, RefillerJob);
        processRegistry.register(CJ_Upgrade, UpgradeJob);
        processRegistry.register(CJ_Repair, RepairJob);
    }
}

import { BasicJob } from "./BasicJob";

class RepairJob extends BasicJob<CreepJob_Memory> {
    protected GetActionType(): ActionType {
        return AT_Repair
    }
    CheckIsTargetStillValid(): boolean {
        let obj = Game.getObjectById(this.memory.t) as Structure;
        return (!!obj && obj.hits < obj.hitsMax);
    }
}
class BuildJob extends BasicJob<CreepJob_Memory> {
    protected GetActionType(): ActionType {
        return AT_Build;
    }
    CheckIsTargetStillValid(): boolean {
        return !!Game.getObjectById(this.memory.t);
    }
}

class RefillerJob extends BasicJob<CreepJob_Memory> {
    protected GetActionType(): ActionType {
        return AT_Transfer;
    }

    CheckIsTargetStillValid() {
        let obj = Game.getObjectById(this.memory.t) as StructureExtension | StructureSpawn;
        return (!!obj && obj.energy < obj.energyCapacity);
    }

    HandleMissingTarget() {
        if (this.memory.a) {
            this.kernel.killProcess(this.memory.a, `KillProcess (RefillerJob.HandleMissingTarget())`);
            delete this.memory.a;
        }
        if (this.creep) {
            this.creepRegistry.releaseCreep(this.creep.name);
            this.creepRegistry.tryReserveCreep(this.creep.name, this.pid);
        }
        this.JobState = JobState_Inactive;
        return ThreadState_Done as ThreadState;
    }

    AssignNewTarget(targetID: string) {
        super.AssignNewTarget(targetID);
        let obj = Game.getObjectById(targetID) as StructureExtension | StructureSpawn;
        if (obj && obj.energyCapacity) {
            if (this.creep && this.creep.carry.energy >= obj.energyCapacity - obj.energy) {
                this.JobState = JobState_Running;
            }
        }
    }
}
class UpgradeJob extends BasicJob<CreepJob_Memory> {
    protected GetActionType(): ActionType {
        return AT_Upgrade;
    }

    CheckIsTargetStillValid() {
        let controller = Game.getObjectById(this.memory.t) as StructureController;
        return (!!controller && controller.owner && controller.owner.username == MY_USERNAME);
    }
}