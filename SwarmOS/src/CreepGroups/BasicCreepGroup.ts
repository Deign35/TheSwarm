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
            if (!this.assignments[childIDs[i]].pid) {
                this.createNewCreepProcess(childIDs[i]);
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
    protected createNewCreepContext(ctID: CT_ALL, level: number, owner?: PID): CreepContext {
        return {
            ct: ctID,
            l: level,
            n: this.GroupPrefix + GetSUID(),
            o: owner
        }
    }

    protected EnsureAssignment(assignmentID: GroupID, ctID: CT_ALL, level: number, context: AssignmentContext = { pri: Priority_Lowest }) {
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

        let childSR = this.spawnRegistry.getRequestContext(assignment.SR);
        if (!childSR) {
            this.createNewCreepProcess(assignmentID);
            childSR = this.spawnRegistry.getRequestContext(assignment.SR);
            if (!childSR) {
                throw new Error(`Restarting of creep thread failed.`);
            }
        }

        if (childSR.l != level) {
            assignment.lvl = level;
            this.createNewCreepProcess(assignmentID);
        }

        this.assignments[assignmentID] = assignment;
    }

    protected createNewCreepProcess(aID: GroupID) {
        let assignment = this.assignments[aID];
        if (assignment && assignment.pid) {
            this.kernel.killProcess(assignment.pid);
            let childSR = this.spawnRegistry.getRequestContext(assignment.SR);
            if (childSR) {
                let creep = this.creepRegistry.tryGetCreep(childSR.n, assignment.pid);
                if (creep) {
                    this.creepRegistry.releaseCreep(creep.name);
                }
            }
        }

        let newContext = this.createNewCreepContext(assignment.CT, assignment.lvl, assignment.pid);
        if (!this.spawnRegistry.tryResetRequest(assignment.SR, newContext)) {
            this.spawnRegistry.cancelRequest(assignment.SR);
            assignment.SR = this.spawnRegistry.requestSpawn(newContext, this.memory.targetRoom, this.memory.pri)
        }

        let newCreepMem = this.createNewCreepMemory(aID);
        assignment.pid = this.kernel.startProcess(CreepBodies[assignment.CT][assignment.lvl].pkg_ID, newCreepMem);
        assignment.GR = this.AttachChildThread(newCreepMem, this.pid, assignment.pid);
    }
}