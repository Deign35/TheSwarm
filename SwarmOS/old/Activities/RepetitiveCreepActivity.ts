export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_RepetitiveCreepActivity, RepetitiveCreepActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class RepetitiveCreepActivity extends BasicProcess<RepetitiveCreepActivity_Memory> {
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;

    RunThread(): ThreadState {
        if (!this.memory.p || !this.kernel.getProcessByPID(this.memory.p)) {
            this.CreateActivityArgs(this.memory.c);
        }

        return ThreadState_Done;
    }

    protected CreateActivityArgs(creepID: CreepID) {
        this.creepRegistry.tryReserveCreep(creepID, this.parentPID);
        let creep = this.creepRegistry.tryGetCreep(creepID, this.parentPID);

        if (!creep || this.memory.a.length == 0) {
            this.EndProcess();
            return;
        }

        while (this.memory.a.length > 0) {
            let nextActivity = this.memory.a.shift()!;
            let activityMemory: CreepActivity_Memory = CopyObject(nextActivity) as CreepActivity_Memory;
            activityMemory.c = this.memory.c;
            this.memory.p = this.creepActivity.CreateNewCreepActivity(activityMemory, this.parentPID);
            if (this.memory.p) {
                if (nextActivity.n === undefined || nextActivity.n-- > 1) {
                    this.memory.a.push(nextActivity); // Put it back in the queue
                }
                this.kernel.setParent(this.memory.p, this.parentPID);
                this.sleeper.sleep(this.pid, 5);
                return;
            }
        }
        this.EndProcess();
    }

    EndProcess() {
        super.EndProcess(this.memory.c);
    }
}