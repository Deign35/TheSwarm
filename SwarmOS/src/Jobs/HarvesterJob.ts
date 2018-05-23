export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CJ_Harvester, HarvesterJob);
    }
}

import { BasicJob } from "./BasicJob";

class HarvesterJob extends BasicJob<CreepJob_Memory> {
    protected GetActionType(): ActionType {
        return AT_Harvest;
    }
    CheckIsTargetStillValid(): boolean {
        return true;
    }

    protected RunState_Preparing(): ThreadState {
        return this.RunState_Running();
    }
    protected RunState_Running(): ThreadState {
        if (!this.creep) {
            // if not, kill the child process and start over
            if (this.memory.a) {
                this.kernel.killProcess(this.memory.a);
                delete this.memory.a;
            }
            delete this.memory.c;
            this.memory.j = JobState_Starting;
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
        return ThreadState_Done;
    }
}