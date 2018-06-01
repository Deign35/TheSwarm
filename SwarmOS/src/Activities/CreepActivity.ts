export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_CreepActivity, CreepActivity);
    }
}

import { SlimProcess } from "Core/BasicTypes";

class CreepActivity extends SlimProcess<ActionMemory> {
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
            switch (result) {
                case (OK):
                    break;
                case (ERR_NOT_OWNER):
                case (ERR_NO_PATH):
                case (ERR_NAME_EXISTS):
                case (ERR_BUSY):
                case (ERR_NOT_FOUND):
                case (ERR_NOT_ENOUGH_RESOURCES):
                case (ERR_INVALID_TARGET):
                case (ERR_FULL):
                case (ERR_NOT_IN_RANGE):
                case (ERR_INVALID_ARGS):
                case (ERR_TIRED):
                case (ERR_NO_BODYPART):
                case (ERR_RCL_NOT_ENOUGH):
                case (ERR_GCL_NOT_ENOUGH):
                    console.log(`ActionMemory(${result}) -- ${JSON.stringify(result)}`);
            }
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