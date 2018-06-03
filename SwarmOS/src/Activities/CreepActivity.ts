export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_CreepActivity, CreepActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class CreepActivity extends BasicProcess<CreepActivity_Memory> {
    @extensionInterface(EXT_CreepActivity)
    protected creepActivity!: ICreepActivityExtensions;
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    @extensionInterface(EXT_Sleep)
    protected sleeper!: IKernelSleepExtension;

    AssignedCreep?: Creep;
    Target?: ObjectTypeWithID;
    TargetPos?: RoomPosition;

    RunThread(): ThreadState {
        this.LoadActionMemory();
        if (!this.AssignedCreep || (!this.Target && !this.TargetPos)) {
            this.EndProcess();
            return ThreadState_Done;
        }

        // (TODO): Change this to be more predictive using the path (e.g. if(this.memory.p.length <= 3))
        if (!this.creepActivity.CreepIsInRange(this.memory.at, this.AssignedCreep.pos, this.TargetPos || this.Target!.pos)) {
            this.creepActivity.MoveCreep(this.AssignedCreep, this.TargetPos || this.Target!.pos, this.memory.p);
        } else {
            let result = this.creepActivity.RunActivity(this.CreateActivityArgs());
            if (result == OK || result == ERR_BUSY || result == ERR_TIRED || result == ERR_NOT_IN_RANGE) {
                return ThreadState_Done;
            }
            for (let i = 0; i < this.memory.f.length; i++) {
                if (result == this.memory.f[i]) {
                    return ThreadState_Done;
                }
            }
            // If we get here, then the action result is not accessible.
            this.EndProcess();
        }

        return ThreadState_Done;
    }

    protected CreateActivityArgs(): RunArgs {
        return {
            actionType: this.memory.at,
            creep: this.AssignedCreep!,
            target: this.Target || this.TargetPos || this.AssignedCreep!.pos,
            amount: this.memory.a,
            message: this.memory.m,
            path: this.memory.p || [],
            resourceType: this.memory.rt,
        }
    }

    protected LoadActionMemory() {
        this.AssignedCreep = this.creepRegistry.tryGetCreep(this.memory.c, this.parentPID);
        this.Target = Game.getObjectById(this.memory.t);
        if (this.memory.tp) {
            this.TargetPos = new RoomPosition(this.memory.tp.x || 25, this.memory.tp.y || 25, this.memory.tp.roomName);
        }
    }

    EndProcess() {
        super.EndProcess(this.memory.c);
    }
}