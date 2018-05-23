export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Build, BuildJob);
        processRegistry.register(CJ_Refiller, RefillerJob);
        processRegistry.register(CJ_Upgrade, UpgradeJob);
    }
}

import { BasicJob } from "./BasicJob";

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
            this.log.info(`KillProcess (RefillerJob.HandleMissingTarget())`);
            this.kernel.killProcess(this.memory.a);
            delete this.memory.a;
        }
        this.creepRegistry.releaseCreep(this.creep.name);
        this.creepRegistry.tryReserveCreep(this.creep.name, this.pid);
        return super.HandleMissingTarget();
    }

    AssignNewTarget(target: StructureExtension | StructureSpawn) {
        super.AssignNewTarget(target);
        if (target.energyCapacity) {
            if (this.creep && this.creep.carry.energy >= target.energyCapacity - target.energy) {
                this.memory.j = JobState_Running;
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