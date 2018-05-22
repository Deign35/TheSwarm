import { ParentThreadProcess } from "Core/AdvancedTypes";

export abstract class BasicCreepGroup<T extends CreepGroup_Memory> extends ParentThreadProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    protected abstract EnsureGroupFormation(): void;
    protected abstract get GroupPrefix(): GroupID;

    protected executeProcess() {
        super.executeProcess();
        // Must be done after as this will create new processes and threads
        this.EnsureGroupFormation();
    }

    protected get assignments() {
        return this.memory.assignments;
    }
    protected IsRoleActive(): boolean {
        return true;
    }

    protected PrepareChildren() {
        let childIDs = Object.keys(this.assignments);
        for (let i = 0; i < childIDs.length; i++) {
            if (!this.assignments[childIDs[i]].pid || !this.kernel.getProcessByPID(this.assignments[childIDs[i]].pid!)) {
                this.CloseChildThread(this.assignments[childIDs[i]].GR);
            }
        }
    }

    protected createNewCreepMemory(aID: GroupID): CreepProcess_Memory {
        let assignment = this.assignments[aID];
        let body = CreepBodies[assignment.CT][assignment.lvl] as CreepBody
        return Object.assign({
            get: false,
            home: this.memory.homeRoom,
            loc: this.memory.targetRoom,
            SR: this.assignments[aID].SR,
            PKG: body.pkg_ID,
            pri: assignment.con.pri,
        }, assignment.con);
    }
    protected createNewCreepContext(ctID: CT_ALL, level: number, respawn: boolean): CreepContext {
        return {
            ct: ctID,
            l: level,
            n: ctID + '_' + level + '_' + GetSUID(),
            o: undefined,
            r: respawn
        }
    }

    protected EnsureAssignment(assignmentID: GroupID, ctID: CT_ALL, level: number, context: AssignmentContext = { pri: Priority_Lowest, res: false }) {
        let assignment = this.assignments[assignmentID];
        if (!assignment) {
            assignment = {
                SR: '',
                GR: ''
            } as CreepGroup_Assignment
        }
        assignment.CT = ctID;
        assignment.lvl = level;
        assignment.con = context;
        this.assignments[assignmentID] = assignment;

        if (!assignment.pid || !this.kernel.getProcessByPID(assignment.pid)) {
            this.createNewCreepProcess(assignmentID, context.pri);
        }
    }

    protected createNewCreepProcess(aID: GroupID, pri: Priority) {
        let assignment = this.assignments[aID];
        let curCreep;
        if (assignment) {
            if (assignment.pid) {
                this.kernel.killProcess(assignment.pid);
            }
            let childSR = this.spawnRegistry.getRequestContext(assignment.SR);
            if (childSR) {
                this.spawnRegistry.cancelRequest(assignment.SR);
                curCreep = this.creepRegistry.tryGetCreep(childSR.n, assignment.pid || this.pid);
                if (curCreep) {
                    this.creepRegistry.releaseCreep(curCreep.name);
                    //this.releaseCreepToParent(aID);
                }
            }
            delete assignment.SR;
        }

        let newCreepMem = this.createNewCreepMemory(aID);
        if (curCreep) {
            newCreepMem.CR = curCreep.name;
        } else {
            let newContext = this.createNewCreepContext(assignment.CT, assignment.lvl, assignment.con.res);
            assignment.SR = this.spawnRegistry.requestSpawn(newContext, this.memory.targetRoom, pri);
        }
        newCreepMem.SR = assignment.SR;
        assignment.pid = this.kernel.startProcess(CreepBodies[assignment.CT][assignment.lvl].pkg_ID, newCreepMem);
        assignment.GR = this.AttachChildThread(newCreepMem, this.pid, assignment.pid);
        if (curCreep) {
            if (!this.creepRegistry.tryReserveCreep(curCreep.name, assignment.pid)) {
                this.log.warn(`This is an issue...  Creep should have been able to be reserved.  Otherwise I wouldn't have it`);
                this.kernel.killProcess(assignment.pid);
                return;
            }
        }
    }

    protected releaseCreepToParent(aID: GroupID) {
        let assignment = this.assignments[aID];
        if (assignment) {
            let spawnRequest = this.spawnRegistry.getRequestContext(assignment.SR);
            if (spawnRequest) {
                this.spawnRegistry.cancelRequest(assignment.SR);
                if (assignment.pid) {
                    this.kernel.killProcess(assignment.pid);
                    let creep = this.creepRegistry.tryGetCreep(spawnRequest.n, assignment.pid);
                    if (creep) {
                        this.creepRegistry.releaseCreep(creep.name);
                        let parentProc = this.parentPID ? this.kernel.getProcessByPID(this.parentPID) as IThreadProcess : undefined;
                        if ((parentProc as BasicCreepGroup<any>).ReceiveCreep) {
                            (parentProc as BasicCreepGroup<any>).ReceiveCreep(creep, assignment);
                        } else {
                            this.log.error(`Creep left to oblivion ${creep.name}`);
                            creep.suicide();
                            return;
                        }
                    }
                }
            }
        }
    }

    ReceiveCreep(creep: Creep, oldAssignment: CreepGroup_Assignment) {
        let parentProc = this.parentPID ? this.kernel.getProcessByPID(this.parentPID) as IThreadProcess : undefined;
        if ((parentProc as BasicCreepGroup<any>).ReceiveCreep) {
            (parentProc as BasicCreepGroup<any>).ReceiveCreep(creep, oldAssignment);
            return;
        } else {
            this.log.error(`Creep left to oblivion ${creep.name}`);
            creep.suicide();
            return;
        }
    }
    CloseChildThread(tid: ThreadID) {
        let ids = Object.keys(this.assignments);
        for (let i = 0; i < ids.length; i++) {
            if (this.assignments[ids[i]].GR == tid) {
                this.CloseAssignment(ids[i]);
            }
        }

        super.CloseChildThread(tid);
    }

    CloseAssignment(aID: GroupID) {
        // (TODO) Dropped creeps here.
        delete this.assignments[aID];
    }
}