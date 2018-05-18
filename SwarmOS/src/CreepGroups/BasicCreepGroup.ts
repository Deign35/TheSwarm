import { ThreadProcess } from "Core/ThreadHandler";


// (TODO): Need to be able to communicate creep state with the group 
// Coop can be turned into a schedule manager.
// Coop will load the programs and run based on priority and such!
// Once this is done, a CreepGroup can then be a tree of groups instead of all one type of creep
// CreepGroup -> SpecificCreep vs CreepGroup -> CreepGroup | AnyCreep
export abstract class BasicCreepGroup<T extends CreepGroup_Memory> extends ThreadProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    View!: IRoomDataExtension;

    protected get assignments() {
        return this.memory.assignments;
    }
    protected IsRoleActive(): boolean {
        return true;
    }
    GetThread() {
        let self = this;
        return (function* () {
            if (!self.IsRoleActive()) {
                // When setting the role to inactive, kill all child processes (release the creeps);
                return;
            }
            yield* self.KillOrRestartDeadProcesses();
            yield* self.EnsureAssignments();
        })();
    }

    protected abstract get CreepPackageID(): string;
    protected abstract get GroupPrefix(): string;
    protected CreateNewCreepMemory(aID: string): CreepProcess_Memory {
        return {
            get: false,
            home: this.memory.homeRoom,
            loc: this.memory.targetRoom,
            SR: this.assignments[aID].SR,
        }
    }
    protected RefreshCreepContext(aID: string): CreepContext {
        let assignment = this.assignments[aID];
        return {
            ct: assignment.CT,
            l: assignment.lvl,
            n: this.GroupPrefix + GetSUID(),
            o: assignment.pid
        }
    }
    protected EnsureAssignments(): IterableIterator<number> {
        let self = this;
        return (function* () {
            let count = 0;
            while (Object.keys(self.assignments).length < self.memory.numReq) {
                self.createNewAssignment(self.GroupPrefix + GetSUID());
                yield ++count;
            }
            return count;
        })();
    }

    protected KillOrRestartDeadProcesses(): IterableIterator<number> {
        let self = this;
        return (function* () {
            let assignmentIDs = Object.keys(self.assignments);
            for (let i = 0; i < assignmentIDs.length; i++) {
                let assignment = self.assignments[assignmentIDs[i]];
                if (assignment.pid) {
                    if (!self.kernel.getProcessByPID(assignment.pid!)) {
                        // process died
                        let SR = assignment.SR;
                        delete self.assignments[assignmentIDs[i]].pid;
                        let curSpawnState = self.spawnRegistry.getRequestStatus(SR);
                        if (curSpawnState == SP_ERROR) {
                            if (!self.spawnRegistry.tryResetRequest(SR, self.RefreshCreepContext(assignmentIDs[i]))) {
                                // Create new context
                                self.log.fatal(`SpawnRequest has disappeard`);
                                self.kernel.killProcess(self.pid);
                            }
                        }
                    }
                }

                if (!self.assignments[assignmentIDs[i]].pid) {
                    self.createNewCreepProcess(assignmentIDs[i]);
                }
                yield i;
            }

            return assignmentIDs.length;
        })();
    }

    protected createNewAssignment(newAssignmentID: string) {
        let newAssignment: CreepGroup_Assignment = {
            CT: this.memory.CT,
            lvl: this.memory.lvl,
            SR: ''
        }

        this.assignments[newAssignmentID] = newAssignment;
        this.createNewCreepProcess(newAssignmentID);
    }

    protected createNewCreepProcess(aID: string) {
        let assignment = this.assignments[aID];
        if (assignment) {
            if (assignment.pid) {
                this.kernel.killProcess(assignment.pid);
            }
        }

        let newCreepContext: CreepContext = {
            ct: this.memory.CT,
            l: this.memory.lvl,
            n: this.GroupPrefix + GetSUID()
        }
        if (!this.spawnRegistry.getRequestContext(assignment.SR)) {
            assignment.SR = this.spawnRegistry.requestSpawn(newCreepContext, this.memory.targetRoom, this.memory.pri)
        } else {
            if (!this.spawnRegistry.tryResetRequest(assignment.SR, newCreepContext)) {
                this.kernel.killProcess(this.pid);
                return;
            }
        }

        let newCreepMemory: CreepProcess_Memory = this.CreateNewCreepMemory(aID);

        let newProcess = this.kernel.startProcess(this.CreepPackageID, newCreepMemory);
        if (!newProcess || !newProcess.pid) {
            this.log.alert(`Failed to create new creep process`);
            return;
        }
        assignment.pid = newProcess.pid;
    }
}