import { BasicProcess } from "Core/BasicTypes";
import { BasicJob } from "Jobs/BasicJob";

export abstract class BasicCreepGroup<T extends CreepGroup_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    protected abstract EnsureGroupFormation(): void;
    protected abstract get GroupPrefix(): GroupID;

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
                this.CloseAssignment(childIDs[i]);
            }
        }
    }

    protected EnsureAssignment(assignmentID: string, ctID: CT_ALL, level: number, priority: Priority, jobType: CreepJobsPackage) {
        let assignment = this.assignments[assignmentID];
        if (!assignment) {
            assignment = {
                ct: ctID,
                lvl: level
            }
        }
        this.assignments[assignmentID] = assignment;

        if (!assignment.pid || !this.kernel.getProcessByPID(assignment.pid)) {
            this.CreateProcessForAssignment(assignmentID, priority, jobType);
        }
    }

    protected CreateProcessForAssignment(aID: string, priority: Priority, jobType: CreepJobsPackage) {
        let assignment = this.assignments[aID];
        let curCreep;
        if (assignment.pid) {
            this.log.info(`KillProcess (BasicCreepGroup.CreateProcessForAssignment(${aID}, ${priority}, ${jobType}))`);
            this.kernel.killProcess(assignment.pid);
        }

        let newCreepMem: CreepJob_Memory = {
            ct: assignment.ct,
            lvl: assignment.lvl,
            h: this.memory.homeRoom,
            l: this.memory.targetRoom,
            j: JobState_Inactive,
            p: priority,
            c: assignment.c || '', //(TODO): This isn't working.  This needs to be updated for fucks sake
            t: '',
            id: aID
        }
        assignment.pid = this.kernel.startProcess(jobType, newCreepMem);
        this.kernel.setParent(assignment.pid, this.pid);
    }

    protected GetAssignmentState(aID: string) {
        if (this.assignments[aID] && this.assignments[aID].pid) {
            let proc = this.kernel.getProcessByPID(this.assignments[aID].pid!) as BasicJob<any>;
            if (proc && proc.GetJobState) {
                return proc.GetJobState();
            }
        }

        return JobState_Inactive;
    }

    protected AssignmentHasValidTarget(aID: string) {
        if (this.assignments[aID] && this.assignments[aID].pid) {
            let proc = this.kernel.getProcessByPID(this.assignments[aID].pid!) as BasicJob<any>;
            if (proc && proc.CheckIsTargetStillValid) {
                return proc.CheckIsTargetStillValid();
            }
        }

        return false;
    }
    // (TODO): Cache the assignment processes?

    protected StartAssignmentIfInactive(aID: string) {
        if (this.assignments[aID] && this.assignments[aID].pid) {
            let proc = this.kernel.getProcessByPID(this.assignments[aID].pid!) as BasicJob<any>;
            if (proc && proc.StartIfInactive) {
                proc.StartIfInactive();
            }
        }
    }

    protected SetAssignmentTarget(aID: string, target: Structure | Creep | Source) {
        if (this.assignments[aID] && this.assignments[aID].pid) {
            let proc = this.kernel.getProcessByPID(this.assignments[aID].pid!) as BasicJob<any>;
            if (proc && proc.AssignNewTarget) {
                proc.AssignNewTarget(target);
            }
        }
    }

    AddCreep(aID: string, id: CreepID) {
        if (this.assignments[aID]) {
            this.assignments[aID].c = id;
        }
    }

    CloseAssignment(aID: GroupID) {
        // (TODO) Dropped creeps here.
        delete this.assignments[aID];
    }
}