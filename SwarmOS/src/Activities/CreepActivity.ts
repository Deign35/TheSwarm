export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(SPKG_CreepActivity, CreepActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class CreepActivity extends BasicProcess<CreepActivity_Memory> {
    AssignedCreep?: Creep;
    Target?: ObjectTypeWithID;
    TargetPos?: RoomPosition;

    PrepTick() {
        this.AssignedCreep = this.creepRegistry.tryGetCreep(this.memory.c, this.parentPID);
        this.Target = Game.getObjectById(this.memory.t);
        if (this.memory.p) {
            this.TargetPos = new RoomPosition(this.memory.p.x || 25, this.memory.p.y || 25, this.memory.p.roomName);
        }
    }
    RunThread(): ThreadState {
        if (!this.AssignedCreep || (!this.Target && !this.TargetPos) || !this.creepActivity.ValidateActionTarget(this.memory.at, this.Target || this.TargetPos)) {
            this.EndActivity();
            return ThreadState_Done;
        }

        let activityArgs = {
            actionType: this.memory.at,
            creep: this.AssignedCreep!,
            target: this.Target || this.TargetPos || this.AssignedCreep!.pos,
            amount: this.memory.a,
            message: this.memory.m,
            resourceType: this.memory.r,
        }

        if (this.memory.at == AT_MoveToPosition) {
            let result = this.creepActivity.RunActivity(activityArgs);
            if (result == ERR_NOT_IN_RANGE || result == ERR_BUSY || result == ERR_TIRED) {
                // Not yet there
            } else if (result == OK) {
                this.EndActivity();
            } else if (result == ERR_NO_PATH) {
                let hasCreep = this.TargetPos!.lookFor(LOOK_CREEPS);
                if (hasCreep && hasCreep.length > 0 && hasCreep[0].name != this.AssignedCreep.name) {
                    let otherCreep = hasCreep[0];
                    this.creepActivity.MoveCreep(otherCreep, this.AssignedCreep.pos);
                } else {
                    this.EndActivity();
                }
            }
            return ThreadState_Done;
        }

        if (!this.creepActivity.CreepIsInRange(this.memory.at, this.AssignedCreep.pos, this.TargetPos || this.Target!.pos)) {
            if (this.creepActivity.MoveCreep(this.AssignedCreep, this.TargetPos || this.Target!.pos) == ERR_NO_PATH) {
                this.EndActivity();
            }
        } else {
            let result = this.creepActivity.RunActivity(activityArgs);
            switch (this.memory.at) {
                case (AT_ClaimController):
                case (AT_Drop):
                case (AT_GenerateSafeMode):
                case (AT_Pickup):
                case (AT_RequestTransfer):
                case (AT_SignController):
                case (AT_Suicide):
                case (AT_Transfer):
                case (AT_Withdraw):
                case (AT_NoOp):
                    this.EndActivity();
                    return ThreadState_Done;
                default:
                    break;
            }
            if (result == OK || result == ERR_BUSY || result == ERR_TIRED) {
                return ThreadState_Done;
            }
            if (this.memory.e) {
                for (let i = 0; i < this.memory.e.length; i++) {
                    if (result == this.memory.e[i]) {
                        return ThreadState_Done;
                    }
                }
            }
            // If we get here, then the action result is not accessible.
            this.EndActivity();
        }

        return ThreadState_Done;
    }

    EndActivity() {
        if (!this.memory.d) {
            this.EndProcess();
            return;
        }
        let parent = this.GetParentProcess();
        if (parent && parent[this.memory.d]) {
            parent[this.memory.d](this.memory.c);
        }

        //(TODO): Change this to put the activity to sleep so as not to waste creating and destroying over and over
        // let the parent decide to destroy or not
        this.EndProcess();
    }
}