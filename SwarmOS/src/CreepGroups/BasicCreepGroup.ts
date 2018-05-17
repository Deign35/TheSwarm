import { BasicProcess } from "Core/BasicTypes";


// (TODO): Need to be able to communicate creep state with the group 
// Coop can be turned into a schedule manager.
// Coop will load the programs and run based on priority and such!
// Once this is done, a CreepGroup can then be a tree of groups instead of all one type of creep
// CreepGroup -> SpecificCreep vs CreepGroup -> CreepGroup | AnyCreep
export abstract class BasicCreepGroup extends BasicProcess<CreepGroup_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    protected get assignments() {
        return this.memory.assignments;
    }
    protected executeProcess(): void {
        if (!this.IsRoleActive()) {
            return;
        }

        let assignmentIDs = Object.keys(this.assignments);
        let numCreepsRequired = this.GetAmountRequired();
        for (let i = 0; i < assignmentIDs.length; i++) {
            let assignment = this.assignments[assignmentIDs[i]];
            if (assignment.pid) {
                if (i > numCreepsRequired) {
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

        while (Object.keys(this.assignments).length < numCreepsRequired) {
            let newCreepContext: CreepContext = {
                b: this.GetCreepType(),
                l: this.GetCreepLevel(),
                n: this.CreateNewCreepName()
            }
            let newAssignment: CreepGroup_CreepRef = {
                CT: newCreepContext.b,
                lvl: newCreepContext.l,
                SR: this.spawnRegistry.requestSpawn(newCreepContext, this.memory.targetRoom, this.pid, Priority_Hold)
            }
            let newAssignmentID = this.CreateNewCreepName();

            this.assignments[newAssignmentID] = newAssignment;
            this.createNewCreepProcess(newAssignmentID);
        }
    }
    protected IsRoleActive(): boolean {
        return false;
    }
    protected GetAmountRequired(): number {
        return 0;
    }
    protected GetCreepPackageID(): string {
        return PKG_CreepHarvester;
    }
    protected GetCreepType(): CT_ALL {
        return CT_Harvester;
    }
    protected GetCreepLevel(): number {
        return 0;
    }

    protected CreateNewCreepName() {
        return 'BCG_' + GetSUID();
    }

    protected createNewCreepProcess(aID: string, priority?: Priority) {
        let assignment = this.assignments[aID];
        if (assignment) {
            if (assignment.pid) {
                this.kernel.killProcess(assignment.pid);
            }
        }

        this.spawnRegistry.resetRequest(assignment.SR, this.CreateNewCreepName());
        let newCreepMemory: CreepProcess_Memory = {
            get: false,
            home: this.memory.homeRoom,
            loc: this.memory.targetRoom,
            SR: assignment.SR,
        }

        let newProcess = this.kernel.startProcess(this.GetCreepPackageID(), newCreepMemory);
        if (!newProcess || !newProcess.pid) {
            this.log.alert(`Failed to create new creep process`);
            return;
        }

        assignment.pid = newProcess.pid;
        this.spawnRegistry.giveRequestToPID(assignment.SR, assignment.pid);
    }
}