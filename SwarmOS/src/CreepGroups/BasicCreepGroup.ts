import { BasicProcess } from "Core/BasicTypes";

export abstract class BasicCreepGroup extends BasicProcess<CreepGroup_Memory> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    protected get assignments() {
        return this.memory.assignments;
    }
    protected executeProcess(): void {
        if (this.IsRoleActive()) {
            return;
        }
    }
    protected IsRoleActive(): boolean {
        return false;
    }
    protected GetAmountRequired(): number {
        return 0;
    }

    protected CreateNewCreepName() {
        return 'BCG_' + GetSUID();
    }

    protected createNewCreepProcess(aID: string, creepType: CT_ALL, creepPackage: string, spawnLevel: number, priority: Priority) {
        let assignment = this.assignments[aID];
        if (assignment) {
            if (assignment.pid) {
                if (this.creepRegistry.tryGetCreep(assignment.SR, assignment.pid)) {
                    // (TODO): Give abandoned creeps to a temp worker group
                    this.creepRegistry.releaseCreep(assignment.SR);
                }
                this.kernel.killProcess(assignment.pid);
            }
            this.spawnRegistry.cancelRequest(assignment.SR);
        }

        assignment = {
            CT: creepType,
            lvl: spawnLevel,
            SR: this.spawnRegistry.requestSpawn({
                b: creepType,
                l: spawnLevel,
                n: this.CreateNewCreepName(),
                o: this.pid
            }, this.memory.targetRoom, this.pid, priority)
        }

        let newCreepContext: CreepProcess_Memory = {
            en: true,
            get: false,
            home: this.memory.homeRoom,
            loc: this.memory.targetRoom,
            SB: creepType,
            SL: spawnLevel,
            SR: assignment.SR,
        }

        let newProcess = this.kernel.startProcess(creepPackage, newCreepContext);
        if (!newProcess || !newProcess.pid) {
            this.log.error(`Process failed to start: ${creepType}:${spawnLevel}`);
            return;
        }

        assignment.pid = newProcess.pid;
        this.spawnRegistry.giveRequestToPID(assignment.SR, assignment.pid);
    }

    /** Old code, dont use.  But there may be some logic, so check it before deleting   */
    protected ensureCreep(aID: string, creepType: CT_ALL, creepPackage: string, spawnLevel: number) {
        let assignment = this.assignments[aID];
        if (!assignment) {
            // Create a new process
        }

        if (assignment.pid) {
            let request = this.spawnRegistry.getRequestStatus(assignment.SR);
        }

        if (assignment.CT != creepType || assignment.lvl != spawnLevel) {
            // Move the creep over to a different assignment
            if (assignment.pid) {
                let creep = this.spawnRegistry.tryGetCreep(assignment.SR, assignment.pid!);
                this.kernel.killProcess(assignment.pid!);
                assignment.pid = undefined;
            }
        }

        if (!assignment.pid || !this.kernel.getProcessById(assignment.pid!)) {
            let newCreepContext: CreepProcess_Memory = {
                en: true,
                get: false,
                home: '',
                loc: '',
                SB: creepType,
                SL: spawnLevel,
                SR: ''
            }

            let newProcess = this.kernel.startProcess(creepPackage, newCreepContext);
            if (!newProcess || !newProcess.pid) {
                this.log.error(`Process failed to start: ${creepType}:${spawnLevel}`);
                return;
            }

            assignment.pid = newProcess.pid;
        }

        this.assignments[aID] = assignment;
    }
}