import { BasicProcess } from "Core/BasicTypes";


// (TODO): Need to be able to communicate creep state with the group 
// Coop can be turned into a schedule manager.
// Coop will load the programs and run based on priority and such!
// Once this is done, a CreepGroup can then be a tree of groups instead of all one type of creep
// CreepGroup -> SpecificCreep vs CreepGroup -> CreepGroup | AnyCreep
export abstract class BasicCreepGroup<T extends CreepGroup_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    View!: IRoomDataExtension;

    protected get assignments() {
        return this.memory.assignments;
    }
    protected executeProcess(): void {
        if (!this.IsRoleActive()) {
            // When setting the role to inactive, kill all child processes (release the creeps);
            return;
        }
        this.KillOrRestartDeadProcesses();
        this.EnsureAssignments();
    }
    protected IsRoleActive(): boolean {
        return true;
    }
    // (TODO): Add these to creep body definition generation -- A group definition table(?)
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
    protected EnsureAssignments(): void {
        while (Object.keys(this.assignments).length < this.memory.numReq) {
            this.createNewAssignment(this.GroupPrefix + GetSUID());
        }
    }

    protected KillOrRestartDeadProcesses() {
        let assignmentIDs = Object.keys(this.assignments);
        for (let i = 0; i < assignmentIDs.length; i++) {
            let assignment = this.assignments[assignmentIDs[i]];
            if (this.assignments[assignmentIDs[i]].pid) {
                if (!this.kernel.getProcessByPID(this.assignments[assignmentIDs[i]].pid!)) {
                    // process died
                    let SR = this.assignments[assignmentIDs[i]].SR;
                    delete this.assignments[assignmentIDs[i]].pid;
                    let curSpawnState = this.spawnRegistry.getRequestStatus(SR);
                    if (curSpawnState == SP_ERROR) {
                        if (!this.spawnRegistry.tryResetRequest(SR)) {
                            // Create new context
                            this.log.fatal(`SpawnRequest has disappeard`);
                            this.kernel.killProcess(this.pid);
                        }
                    }
                }
            }

            if (!this.assignments[assignmentIDs[i]].pid) {
                this.createNewCreepProcess(assignmentIDs[i]);
            }
        }
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
            b: this.memory.CT,
            l: this.memory.lvl,
            n: this.GroupPrefix + GetSUID()
        }
        if (!this.spawnRegistry.getRequestContext(assignment.SR)) {
            assignment.SR = this.spawnRegistry.requestSpawn(newCreepContext, this.memory.targetRoom, this.pid, this.memory.pri)
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