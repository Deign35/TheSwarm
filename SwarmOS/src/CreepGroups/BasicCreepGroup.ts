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
    protected abstract CreateNewCreepMemory(aID: string): CreepProcess_Memory;
    protected EnsureAssignments(): void {
        while (Object.keys(this.assignments).length < this.memory.numReq) {
            this.createNewAssignment(this.GroupPrefix + GetSUID());
        }
    }

    protected KillOrRestartDeadProcesses() {
        let assignmentIDs = Object.keys(this.assignments);
        for (let i = 0; i < assignmentIDs.length; i++) {
            let assignment = this.assignments[assignmentIDs[i]];
            if (assignment.pid) {
                if (i > this.memory.numReq) {
                    this.kernel.killProcess(assignment.pid);
                    delete this.assignments[assignmentIDs[i]];
                    continue;
                }
                if (!this.kernel.getProcessById(assignment.pid)) {
                    // Creep died
                    assignment.pid = undefined;
                    this.createNewCreepProcess(assignmentIDs[i]);
                }
            }
        }
    }

    protected createNewAssignment(newAssignmentID: string) {
        let newCreepContext: CreepContext = {
            b: this.memory.CT,
            l: this.memory.lvl,
            n: newAssignmentID
        }
        let newAssignment: CreepGroup_Assignment = {
            CT: newCreepContext.b,
            lvl: newCreepContext.l,
            SR: this.spawnRegistry.requestSpawn(newCreepContext, this.memory.targetRoom, this.pid, this.memory.pri)
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

        this.spawnRegistry.resetRequest(assignment.SR, this.GroupPrefix + GetSUID());
        let newCreepMemory: CreepProcess_Memory = this.CreateNewCreepMemory(aID);

        let newProcess = this.kernel.startProcess(this.CreepPackageID, newCreepMemory);
        if (!newProcess || !newProcess.pid) {
            this.log.alert(`Failed to create new creep process`);
            return;
        }

        assignment.pid = newProcess.pid;
        this.spawnRegistry.giveRequestToPID(assignment.SR, assignment.pid);
    }
}