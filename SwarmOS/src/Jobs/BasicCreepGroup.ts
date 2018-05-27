import { BasicProcess } from "Core/BasicTypes";

export abstract class BasicCreepGroup<T extends CreepGroup_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    protected abstract EnsureGroupFormation(): void;

    protected get assignments() {
        return this.memory.assignments;
    }

    RunThread() {
        this.EnsureGroupFormation();
        return ThreadState_Done as ThreadState;
    }
    PrepTick() {
        let childIDs = Object.keys(this.assignments);
        for (let i = 0; i < childIDs.length; i++) {
            if (!this.assignments[childIDs[i]].pid || !this.kernel.getProcessByPID(this.assignments[childIDs[i]].pid!)) {
                this.RemoveCreepFromAssignment(childIDs[i]);
            }
        }
    }

    protected EnsureAssignment(aID: string, ctID: CT_ALL, level: number, priority: Priority,
        jobType: CreepJobsPackage, targetType: TargetType, targetID?: string) {
        try {
            if (!this.assignments[aID]) {
                this.assignments[aID] = {
                    ct: ctID,
                    lvl: level,
                    tt: targetType
                }
            }
            let assignment = this.assignments[aID];
            if (assignment.pid && (assignment.ct != ctID || assignment.lvl != level)) {
                this.CloseAssignment(aID);
                assignment.ct = ctID;
                assignment.lvl = level;
                assignment.tt = targetType;
            }

            if (!assignment.pid || !this.kernel.getProcessByPID(assignment.pid)) {
                this.CreateProcessForAssignment(aID, priority, jobType, targetID);
            }

            // (TODO): Update the process if the targetID has changed.
        } catch (ex) {
            this.log.error(`${ex} error ensuring assignment`);
            delete this.assignments[aID];
        }
    }

    protected CreateProcessForAssignment(aID: string, priority: Priority, jobType: CreepJobsPackage, targetID?: string) {
        let assignment = this.assignments[aID];
        if (assignment.pid) {
            this.CloseAssignment(aID);
        }
        let newCreepMem: BasicJob_Memory = {
            ct: assignment.ct,
            lvl: assignment.lvl,
            home: this.memory.homeRoom,
            loc: this.memory.targetRoom,
            pri: priority,
            cID: '',
            obj: targetID || '',
            tar: targetID || '',
            tt: assignment.tt,
            ac: AT_NoOp,
            id: aID,
            expires: true
        }
        assignment.pid = this.kernel.startProcess(jobType, newCreepMem);
        this.kernel.setParent(assignment.pid, this.pid);
    }

    CloseAssignment(aID: GroupID): void {
        this.RemoveCreepFromAssignment(aID);
        if (this.assignments[aID] && this.assignments[aID].pid) {
            this.kernel.killProcess(this.assignments[aID].pid!, `Assignment(${aID}) closed`)
        }
    }

    RemoveCreepFromAssignment(aID: GroupID): void {
        let assignment = this.assignments[aID];
        if (assignment) {
            this.creepRegistry.releaseCreep(assignment.c, assignment.pid);
            let spawnRequest = this.spawnRegistry.getRequestContext(assignment.c);
            if (spawnRequest) {
                this.spawnRegistry.cancelRequest(assignment.c);
            }
            assignment.c = undefined;
        }
    }
}