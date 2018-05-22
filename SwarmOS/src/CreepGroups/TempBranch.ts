import { ExtensionBase } from "Core/BasicTypes";
import { BasicCreepGroup } from "CreepGroups/BasicCreepGroup";

export const OSPackage: IPackage<TempBranchGroup_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_TempBranch, TempBranchGroup);
    }
}

export class TempBranchGroup extends BasicCreepGroup<TempBranchGroup_Memory> {
    protected EnsureGroupFormation(): void {
        for (let i = 0; i < this.memory.unprocessedCreeps.length; i++) {
            // Use creep names as the group id.
            this.EnsureAssignment(this.memory.unprocessedCreeps[i].context.n,
                this.memory.unprocessedCreeps[i].context.ct,
                this.memory.unprocessedCreeps[i].context.l,
                {
                    pri: Priority_Low,
                    res: false
                });
            // Kill the old job, and make a new one.
            //this.AssignNewTempJob(this.memory.unprocessedCreeps[i].context.n, this.memory.unprocessedCreeps[i].mem);
        }

        this.memory.unprocessedCreeps = [];

        for (let group in this.memory.jobs) {
            for (let i = 0; i < this.memory.jobs[group].length; i++) {// id in this.memory.jobs[group]) {
                let threadID = this.memory.jobs[group][i];
                /*if (!this.kernel.getProcessByPID(this.children[threadID].pid)) {
                    this.memory.jobs[group].splice(i--, 1);
                }*/
            }
        }
    }/*
    protected AssignNewTempJob(creepName: GroupID, creepMem: CreepProcess_Memory) {
        let curJob = this.assignments[creepName];
        let creep;
        if (curJob.pid && curJob.pid != this.pid) {
            this.kernel.killProcess(curJob.pid);
            creep = this.creepRegistry.tryGetCreep(creepName, curJob.pid);
            if (creep) {
                this.creepRegistry.releaseCreep(creepName);
            }
            curJob.pid = undefined;
        }

        if (!this.creepRegistry.tryReserveCreep(creepName, this.pid)) {
            // This would mean the creep is not available
            return;
        }
        creep = this.creepRegistry.tryGetCreep(creepName, this.pid);

        if (!creep) {
            return;
        }

        this.FindJobForCreep(creep, creepMem);
    }

    protected FindJobForCreep(creep: Creep, creepMem: MemBase) {
        let curAssignment = this.assignments[creep.name];
        let body = CreepBodies.get(curAssignment.CT)[curAssignment.lvl] as CreepBody;
        let newJobContext = this.createNewCreepContext(body.ct_ID, body.lvl, false);

        if (!newJobContext || body.a || body.h || body.r || body.cl || creep.carryCapacity == 0) {
            this.log.error(`Undefined body behaviour`);
            creep.suicide();
            return;
        }

        let viewData = this.View.GetRoomData(creep.room.name)!;
        let newJobPackage;

        let energy = creep.carry.energy;
        if (body.w && body.w > 0 && creep.carryCapacity > 0) {
            // Create a work thread.
            if (viewData.cSites.length > 0 && this.memory.jobs.CreepBuilder.length * 3 < viewData.cSites.length) {
                creepMem.PKG = PKG_CreepBuilder;
            } else if (viewData.owner && viewData.owner == MY_USERNAME) {
                creepMem.PKG = PKG_CreepUpgrader;
            } else {
                creepMem.PKG = PKG_CreepRefiller;
            }
        } else {
            creepMem.PKG = PKG_CreepRefiller;
        }

        if (!creepMem.PKG) {
            creepMem.PKG = PKG_CreepRefiller;
        }
        this.memory.jobs[creepMem.PKG].push(this.AttachChildThread(creepMem, this.pid));
    }*/

    ReceiveCreep(creep: Creep, oldAssignment: CreepGroup_Assignment) {
        this.memory.unprocessedCreeps.push({
            context: {
                ct: oldAssignment.CT,
                l: oldAssignment.lvl,
                n: creep.name,
                o: this.pid,
                r: false
            },
            mem: {
                CR: creep.name,
                get: false,
                home: creep.room.name,
                loc: creep.room.name,
            }
        })
    }

    protected get GroupPrefix(): string { return 'TMP'; }
}