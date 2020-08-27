export const OSPackage: IPackage = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(APKG_RepetitiveCreepActivity, RepetitiveCreepActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class RepetitiveCreepActivity extends BasicProcess<RepetitiveCreepActivity_Memory> {
    @extensionInterface(EXT_CreepManager)
    protected creepManager!: ICreepManagerExtensions;

    RunThread(): ThreadState {
        if (!this.memory.childPID || !this.kernel.getProcessByPID(this.memory.childPID)) {
            this.CreateActivityArgs(this.memory.creepID);
        }

        return ThreadState_Done;
    }

    protected CreateActivityArgs(creepID: CreepID) {
        this.creepManager.tryReserveCreep(creepID, this.parentPID);
        let creep = this.creepManager.tryGetCreep(creepID, this.parentPID);

        if (!creep || this.memory.actions.length == 0) {
            this.EndProcess();
            return;
        }

        while (this.memory.actions.length > 0) {
            let nextActivity = this.memory.actions.shift()!;
            let activityMemory: SingleCreepAction_Memory = CopyObject(nextActivity) as SingleCreepAction_Memory;
            activityMemory.creepID = this.memory.creepID;
            this.memory.childPID = this.creepManager.CreateNewCreepActivity(activityMemory, this.parentPID);
            if (this.memory.childPID) {
                if (nextActivity.num === undefined || nextActivity.num-- > 1) {
                    this.memory.actions.push(nextActivity); // Put it back in the queue
                }
                this.kernel.setParent(this.memory.childPID, this.parentPID);
                this.sleeper.sleep(this.pid, 5);
                return;
            }
        }
        this.EndProcess();
    }

    EndProcess() {
        super.EndProcess(this.memory.creepID);
    }
}