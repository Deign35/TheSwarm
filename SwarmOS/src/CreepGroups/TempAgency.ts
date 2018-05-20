/*declare var Memory: {
    TempAgency: ITempAgency_Memory;
}
declare interface ITempAgency_Memory extends CreepGroup_Memory {
    hostPID: PID;
    unprocessedCreeps: {
        context: CreepContext
        mem: CreepProcess_Memory
    }[];

    jobs: {
        [id in RoomID]: {
            [PKG_CreepBuilder]: GroupID[],
            [PKG_CreepHarvester]: GroupID[],
            [PKG_CreepRefiller]: GroupID[],
            [PKG_CreepUpgrader]: GroupID[]
        }
    }
}

import { ExtensionBase } from "Core/BasicTypes";
import { BasicCreepGroup } from "CreepGroups/BasicCreepGroup";

export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_TempAgency, TempAgencyCreepGroup);
    }
}

class TempAgencyCreepGroup extends BasicCreepGroup<ITempAgency_Memory> {
    protected get memory() {
        if (!Memory.TempAgency) {
            Memory.TempAgency = {
                assignments: {},
                childThreads: {},
                enabled: true,
                homeRoom: '',
                targetRoom: '',
                hostPID: '',
                pri: Priority_Lowest,
                unprocessedCreeps: [],
                PKG: PKG_TempAgency,
                jobs: {}
            };
        }
        return Memory.TempAgency
    }

    protected EnsureGroupFormation(): void {
        for (let i = 0; i < this.memory.unprocessedCreeps.length; i++) {
            // Use creep names as the group id.
            this.EnsureAssignment(this.memory.unprocessedCreeps[i].context.n,
                this.memory.unprocessedCreeps[i].context.ct,
                this.memory.unprocessedCreeps[i].context.l,
                {
                    pri: Priority_Low
                });
            // Kill the old job, and make a new one.
            this.AssignNewTempJob(this.memory.unprocessedCreeps[i].context.n, this.memory.unprocessedCreeps[i].mem);
        }

        this.memory.unprocessedCreeps = [];
    }
    protected AssignNewTempJob(creepName: GroupID, creepMem: CreepProcess_Memory) {
        let curJob = this.assignments[creepName];
        let creep;
        if (curJob.pid) {
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

    protected FindJobForCreep(creep: Creep, creepMem: ThreadMemory) {
        let curAssignment = this.assignments[creep.name];
        let body = CreepBodies.get(curAssignment.CT)[curAssignment.lvl] as CreepBody;
        let newJobContext = this.createNewCreepContext(body.ct_ID, body.lvl);

        if (!newJobContext || body.a || body.h || body.r || body.cl || creep.carryCapacity == 0) {
            this.log.error(`Undefined body behaviour`);
            creep.suicide();
            return;
        }

        let room = creep.room;
        if (!this.memory.jobs[room.name]) {
            this.memory.jobs[room.name] = {
                CreepBuilder: [],
                CreepHarvester: [],
                CreepRefiller: [],
                CreepUpgrader: []
            }
        }

        let viewData = this.View.GetRoomData(room.name)!;
        let newJobPackage;

        let energy = creep.carry.energy;
        if (body.w && body.w > 0 && creep.carryCapacity > 0) {
            // Create a work thread.
            if (viewData.cSites.length > 0 && this.memory.jobs[room.name].CreepBuilder.length * 3 < viewData.cSites.length) {
                creepMem.PKG = PKG_CreepBuilder;
            } else if (viewData.owner && viewData.owner == MY_USERNAME) {
                creepMem.PKG = PKG_CreepUpgrader;
            } else if (viewData.sourceIDs.length > 0 && this.memory.jobs[room.name].CreepHarvester.length < 1) {
                creepMem.PKG = PKG_CreepHarvester;
            } else {
                creepMem.PKG = PKG_CreepRefiller;
            }
        } else {
            creepMem.PKG = PKG_CreepRefiller;
        }

        if (!creepMem.PKG) {
            creepMem.PKG = PKG_CreepRefiller;
        }
        this.memory.jobs[room.name][creepMem.PKG].push(this.AttachChildThread(creepMem, this.pid));
    }

    protected get GroupPrefix(): string { return 'TMP'; }
}

class TempAgencyExtension extends ExtensionBase {
    protected get memory() {
        if (!Memory.TempAgency) {
            Memory.TempAgency = {
                assignments: {},
                childThreads: {},
                enabled: true,
                homeRoom: '',
                targetRoom: '',
                hostPID: '',
                pri: Priority_Lowest,
                unprocessedCreeps: [],
                PKG: PKG_TempAgency,
                jobs: {}
            };
        }

        return Memory.TempAgency;
    }

    AssignCreep(creepContext: CreepContext, creepMem: CreepProcess_Memory) {
        this.memory.unprocessedCreeps.push({
            context: creepContext,
            mem: creepMem
        });
    }
}*/