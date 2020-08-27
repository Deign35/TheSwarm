export const OSPackage: IPackage = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(APKG_CreepActivity, CreepActivity);
    }
}

import { BasicProcess } from "Core/BasicTypes";

class CreepActivity extends BasicProcess<SingleCreepAction_Memory> {
    @extensionInterface(EXT_CreepManager)
    protected creepManager!: ICreepManagerExtensions;
    @extensionInterface(EXT_RoomManager)
    protected roomManager!: IRoomManagerExtension;

    AssignedCreep?: Creep;
    Target?: ObjectTypeWithID | null;
    TargetPos?: RoomPosition;

    RunThread(): ThreadState {
        this.LoadActionMemory();
        if (!this.AssignedCreep || (!this.Target && !this.TargetPos)) {
            this.EndProcess();
            return ThreadState_Done;
        }

        if (this.memory.action == AT_MoveToPosition) {
            let result = this.creepManager.RunCreepAction(this.CreateActivityArgs());
            if (result == ERR_NOT_IN_RANGE || result == ERR_BUSY || result == ERR_TIRED) {
                // Not yet there
            } else if (result == OK) {
                this.EndProcess();
            } else if (result == ERR_NO_PATH) {
                let hasCreep = this.TargetPos!.lookFor(LOOK_CREEPS);
                if (hasCreep && hasCreep.length > 0) {
                    let otherCreep = hasCreep[0];
                    this.creepManager.MoveCreep(otherCreep, this.AssignedCreep.pos);
                }
            }
            return ThreadState_Done;
        }

        if (!this.creepManager.CreepIsInRange(this.memory.action, this.AssignedCreep.pos, this.TargetPos || this.Target!.pos)) {
            this.creepManager.MoveCreep(this.AssignedCreep, this.TargetPos || this.Target!.pos);
        } else {
            let result = this.creepManager.RunCreepAction(this.CreateActivityArgs());
            switch (this.memory.action) {
                case (AT_ClaimController):
                case (AT_Drop):
                case (AT_GenerateSafeMode):
                case (AT_Pickup):
                case (AT_RequestTransfer):
                case (AT_SignController):
                case (AT_Suicide):
                case (AT_Transfer):
                case (AT_Withdraw):
                    this.EndProcess();
                    return ThreadState_Done;
                default:
                    break;
            }
            if (result == OK || result == ERR_BUSY || result == ERR_TIRED || result == ERR_NOT_IN_RANGE) {
                return ThreadState_Done;
            }
            if (this.memory.exemptedFailures) {
                for (let i = 0; i < this.memory.exemptedFailures.length; i++) {
                    if (result == this.memory.exemptedFailures[i]) {
                        return ThreadState_Done;
                    }
                }
            }
            // If we get here, then the action result is not accessible.
            this.EndProcess();
        }

        return ThreadState_Done;
    }

    protected CreateActivityArgs(): CreepActionArgs {
        return {
            actionType: this.memory.action,
            creep: this.AssignedCreep!,
            target: this.Target || this.TargetPos || this.AssignedCreep!.pos,
            amount: this.memory.amount,
            message: this.memory.message,
            resourceType: this.memory.resourceType,
        }
    }

    protected LoadActionMemory() {
        this.AssignedCreep = this.creepManager.tryGetCreep(this.memory.creepID, this.parentPID);
        if (this.memory.targetID) {
            this.Target = Game.getObjectById<ObjectTypeWithID | null>(this.memory.targetID);
        }
        if (this.memory.pos) {
            this.TargetPos = new RoomPosition(this.memory.pos.x || 25, this.memory.pos.y || 25, this.memory.pos.roomName);
        }
    }
}