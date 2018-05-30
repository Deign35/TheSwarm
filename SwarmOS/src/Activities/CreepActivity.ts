import { SlimProcess } from "Core/BasicTypes";
import { ActivityRunner, RunArgs } from "./ActivityRunner";

export abstract class CreepActivity extends SlimProcess<ActionMemory> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;
    @extensionInterface(EXT_Sleep)
    protected sleeper!: IKernelSleepExtension;

    AssignedCreep?: Creep;
    Target?: ObjectTypeWithID;
    TargetPos?: RoomPosition;

    PreTick() {
        this.LoadActionMemory();
    }    // (TODO): Change throw new error to wake parent process blah blah?
    RunThread(): ThreadState {
        if (!this.AssignedCreep || (!this.Target && !this.TargetPos)) {
            this.EndActivity(`Creep(${this.memory.c} -- [${this.AssignedCreep}]) or Target(${this.memory.t} -- [${this.Target}]) was not found`);
            return ThreadState_Done;
        }
        if (!ActivityRunner.ValidateActionTarget(this.memory.at, this.Target)) {
            this.EndActivity(`Target(${this.memory.t} -- [${this.Target}]) couldn't be targeted by AT(${this.memory.at})`);
        }
        if (!ActivityRunner.CreepIsInRange(this.memory.at, this.AssignedCreep.pos, this.TargetPos || this.Target!.pos)) {
            ActivityRunner.MoveCreep(this.AssignedCreep, this.TargetPos || this.Target!.pos);
        } else {
            let result = ActivityRunner.RunActivity(this.CreateActivityArgs());
            switch (result) {
                case (OK):
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
            target: this.Target || this.TargetPos,
            amount: this.memory.a,
            message: this.memory.m,
            path: this.memory.p,
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

    protected EndActivity(killMessage: string) {
        let parentProcess = this.GetParentProcess(); // this.GetParentProcess<SomeProcessType>();
        // parentProcess.dosomething();

        this.sleeper.wake(this.parentPID);
        this.kernel.killProcess(this.pid, killMessage);
    }
}