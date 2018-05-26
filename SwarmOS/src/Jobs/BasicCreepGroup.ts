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
    protected get creeps() {
        return this.memory.creeps;
    }
    protected get repairQueue() {
        return this.memory.repairQueue;
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

        let creepIDs = Object.keys(this.creeps);
        for (let i = 0; i < creepIDs.length; i++) {
            let id = creepIDs[i];
            const delayTime = 10;
            if (!this.creeps[id].active && Game.time - delayTime >= (this.creeps[id].idle || 0)) {
                let assignment = this.assignments[this.creeps[id].aID];
                this.log.warn(`Creep(${id}) has been idle for ${delayTime} ticks`);
                this.creepRegistry.releaseCreep(this.creeps[id].name);
                delete this.creeps[id];
            }
        }

        // (TODO): Make this a thread that can be slept
        if (this.repairQueue.length == 0) {
            let targetRoom = Game.rooms[this.memory.targetRoom];
            if (targetRoom) {
                let structs = targetRoom.find(FIND_STRUCTURES);
                for (let i = 0; i < structs.length; i++) {
                    if (structs[i].hits < structs[i].hitsMax) {
                        this.repairQueue.push(structs[i].id);
                    }
                }
            }
        }
    }

    protected EnsureAssignment(assignmentID: string, ctID: CT_ALL, level: number, priority: Priority, jobType: CreepJobsPackage, targetType: TargetType) {
        if (!this.assignments[assignmentID]) {
            this.assignments[assignmentID] = {
                ct: ctID,
                lvl: level,
                tt: targetType
            }
        }
        let assignment = this.assignments[assignmentID];
        if (assignment.pid && (assignment.ct != ctID || assignment.lvl != level)) {
            this.RemoveCreepFromAssignment(assignmentID);
            this.kernel.killProcess(assignment.pid, 'Assignment needs to be upgraded');
            assignment.ct = ctID;
            assignment.lvl = level;
            assignment.tt = targetType;
        }

        if (!assignment.pid || !this.kernel.getProcessByPID(assignment.pid)) {
            this.CreateProcessForAssignment(assignmentID, priority, jobType);
        }
    }

    protected CreateProcessForAssignment(aID: string, priority: Priority, jobType: CreepJobsPackage) {
        let assignment = this.assignments[aID];
        let curCreep;
        if (assignment.pid) {
            this.log.info(`KillProcess (BasicCreepGroup.CreateProcessForAssignment(${aID}, ${priority}, ${jobType}))`);
            this.log.alert(`THIS IS REALLY BAD`);
            this.kernel.killProcess(assignment.pid, `BasicCrepGroup.CreateProcessForAssignment()`);
        }

        let creepIDs = Object.keys(this.creeps);
        for (let i = 0; i < creepIDs.length; i++) {
            if (this.creeps[creepIDs[i]].aID == aID) {
                if (this.creeps[creepIDs[i]].active) {
                    this.log.error(`Creep was not properly let go`);
                }

                if (assignment.c && this.spawnRegistry.getRequestContext(assignment.c)) {
                    this.spawnRegistry.cancelRequest(assignment.c);
                    this.log.info(`Overwrite spawn request with an existing creep`);
                } else if (assignment.c && assignment.c != this.creeps[creepIDs[i]].name) {
                    this.creepRegistry.releaseCreep(assignment.c);
                    this.log.info(`Overwrite a different creep (old[${assignment.c}] - new[${this.creeps[creepIDs[i]].name}]`);
                }
                assignment.c = this.creeps[creepIDs[i]].name;
                this.creeps[creepIDs[i]].active = true;
                delete this.creeps[creepIDs[i]].idle;
                break;
            }
        }
        let newCreepMem: BasicJob_Memory = {
            ct: assignment.ct,
            lvl: assignment.lvl,
            home: this.memory.homeRoom,
            loc: this.memory.targetRoom,
            pri: priority,
            cID: assignment.c || '',
            obj: '',
            tar: '',
            tt: assignment.tt,
            ac: AT_NoOp,
            id: aID,
            exp: true
        }
        assignment.pid = this.kernel.startProcess(jobType, newCreepMem);
        this.kernel.setParent(assignment.pid, this.pid);
        if (assignment.c) {
            this.creepRegistry.tryReleaseCreepToPID(assignment.c, this.pid, assignment.pid);
            this.creeps[assignment.c].aID = aID;
            delete this.creeps[assignment.c].idle;
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

    protected RemoveCreepFromAssignment(aID: GroupID): void {
        let assignment = this.assignments[aID];
        if (assignment && assignment.c) {
            let orphanedCreep = this.creepRegistry.tryGetCreep(assignment.c, assignment.pid || this.pid);
            if (orphanedCreep) {
                this.creepRegistry.tryReleaseCreepToPID(orphanedCreep.name, assignment.pid || this.pid, this.pid);
                this.memory.creeps[orphanedCreep.name].active = false;
                this.memory.creeps[orphanedCreep.name].idle = Game.time;
            } else {
                let spawnRequest = this.spawnRegistry.getRequestContext(assignment.c);
                if (spawnRequest) {
                    this.spawnRegistry.cancelRequest(assignment.c);
                }
            }
            assignment.c = undefined;
        }
    }
}