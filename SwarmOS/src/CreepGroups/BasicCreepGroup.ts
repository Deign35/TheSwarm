import { ParentThreadProcess } from "Core/AdvancedTypes";

export abstract class BasicCreepGroup<T extends CreepGroup_Memory> extends ParentThreadProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    protected abstract EnsureGroupFormation(): ThreadState;
    protected abstract get GroupPrefix(): GroupID;

    protected get assignments() {
        return this.memory.assignments;
    }
    protected IsRoleActive(): boolean {
        return true;
    }

    protected PrepareChildren() {
        if (this.IsRoleActive()) {
            this.EnsureGroupFormation();
        }

        let childIDs = Object.keys(this.assignments);
        for (let i = 0; i < childIDs.length; i++) {
            if (!this.assignments[childIDs[i]].pid) {
                this.createNewCreepProcess(childIDs[i]);
            }
        }
    }

    protected createNewCreepMemory(aID: GroupID): CreepProcess_Memory {
        return {
            get: false,
            home: this.memory.homeRoom,
            loc: this.memory.targetRoom,
            SR: this.assignments[aID].SR,
        }
    }
    protected createNewCreepContext(ctID: CT_ALL, level: number, owner?: PID): CreepContext {
        return {
            ct: ctID,
            l: level,
            n: this.GroupPrefix + GetSUID(),
            o: owner
        }
    }

    protected createNewAssignment(newAssignmentID: GroupID, ctID: CT_ALL, level: number) {
        let newAssignment: CreepGroup_Assignment = {
            CT: ctID,
            lvl: level,
            SR: ''
        }
        this.assignments[newAssignmentID] = newAssignment;
        this.createNewCreepProcess(newAssignmentID);
    }

    protected createNewCreepProcess(aID: GroupID) {
        let assignment = this.assignments[aID];
        if (assignment) {
            if (assignment.pid) {
                this.kernel.killProcess(assignment.pid);
            }
        }

        let newContext = this.createNewCreepContext(assignment.CT, assignment.lvl, assignment.pid);
        if (!this.spawnRegistry.tryResetRequest(assignment.SR, newContext)) {
            this.spawnRegistry.cancelRequest(assignment.SR);
        } else {
            assignment.SR = this.spawnRegistry.requestSpawn(newContext, this.memory.targetRoom, this.memory.pri)
        }

        assignment.pid = this.kernel.startProcess(CreepBodies[assignment.CT][assignment.lvl].PKG_ID, this.createNewCreepMemory(aID));
    }
}