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
    protected get creeps() {
        return this.memory.creeps;
    }

    RunThread() {
        this.EnsureGroupFormation();
        return ThreadState_Done as ThreadState;
    }
    PrepTick() {
        let childIDs = Object.keys(this.assignments);
        for (let i = 0; i < childIDs.length; i++) {
            if (!this.assignments[childIDs[i]].pid || !this.kernel.getProcessByPID(this.assignments[childIDs[i]].pid!)) {
                this.HandleDeadJob(childIDs[i]);
            }
        }

        let creepIDs = Object.keys(this.creeps);
        for (let i = 0; i < creepIDs.length; i++) {
            let id = creepIDs[i];
            const delayTime = 10;
            if (!this.creeps[id].active && Game.time - delayTime >= (this.creeps[id].idle || 0)) {
                let assignment = this.assignments[this.creeps[id].aID];
                this.log.warn(`Creep(${id}) has been idle for ${delayTime} ticks`);
                // Do something with this creep...
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
        } else {
            // (TODO): Check if the level or CTID have changed.
        }
    }

    protected CreateProcessForAssignment(aID: string, priority: Priority, jobType: CreepJobsPackage) {
        let assignment = this.assignments[aID];
        let curCreep;
        if (assignment.pid) {
            this.log.info(`KillProcess (BasicCreepGroup.CreateProcessForAssignment(${aID}, ${priority}, ${jobType}))`);
            this.kernel.killProcess(assignment.pid, `BasicCrepGroup.CreateProcessForAssignment()`);
        }

        let creepIDs = Object.keys(this.creeps);
        for (let i = 0; i < creepIDs.length; i++) {
            if (this.creeps[creepIDs[i]].aID == aID) {
                if (this.creeps[creepIDs[i]].active) {
                    this.log.error(`Creep was not properly let go`);
                }
                assignment.c = this.creeps[creepIDs[i]].name;
                this.creeps[creepIDs[i]].active = true;
                delete this.creeps[creepIDs[i]].idle;
                break;
            }
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
            if (proc && proc.JobState) {
                return proc.JobState;
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

    SetCreep(aID: string, id: CreepID) {
        if (this.assignments[aID]) {
            this.assignments[aID].c = id;
            if (!this.creeps[id]) {
                this.creeps[id] = {
                    active: true,
                    aID: aID,
                    name: id
                }
            }
        }
    }

    protected HandleDeadJob(aID: GroupID): void {
        let assignment = this.assignments[aID];
        if (assignment && assignment.c) {
            let orphanedCreep = this.creepRegistry.tryGetCreep(assignment.c, assignment.pid || this.pid);
            if (orphanedCreep) {
                this.creepRegistry.releaseCreep(orphanedCreep.name);
                this.memory.creeps[orphanedCreep.name].active = false;
                this.memory.creeps[orphanedCreep.name].idle = Game.time;
            }
            delete this.assignments[aID];
        }
    }
}