declare var Memory: {
    TempAgency: ITempAgency_Memory;
}
declare interface ITempAgency_Memory extends CreepGroup_Memory {
    hostPID: PID;
    unprocessedCreeps: CreepContext[];
}

import { BasicCreepGroup } from "./BasicCreepGroup";
import { ExtensionBase } from "Core/BasicTypes";
export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(CG_Builder, TempAgencyCreepGroup);
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
                PKG: CG_TempAgency,
                sta: ThreadState_Active
            };
        }
        return Memory.TempAgency
    }
    protected EnsureGroupFormation(): void {
        for (let i = 0; i < this.memory.unprocessedCreeps.length; i++) {
            // Use creep names as the group id.
            this.createNewAssignment(this.memory.unprocessedCreeps[i].n, this.memory.unprocessedCreeps[i].ct, this.memory.unprocessedCreeps[i].l);
        }
    }
    protected AssignNewTempJob(creepName: GroupID) {
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

        this.FindJobForCreep(creep);
    }

    protected FindJobForCreep(creep: Creep) {
        let curAssignment = this.assignments[creep.name];
        let body = CreepBodies.get(curAssignment.CT)[curAssignment.lvl] as CreepBody;

        if (body.a || body.h || body.r || body.cl || creep.carryCapacity == 0) {
            this.log.error(`Undefined body behaviour`);
            creep.suicide();
            return;
        }

        let energy = creep.carry.energy;
        if (energy == 0) {
            // Create a Retrieval thread.
        }
        if (body.w && body.w > 0) {
            // Create a work thread.
        } else {
            // Create a deliver thread.
        }
    }

    protected get GroupPrefix(): string { return 'TMP'; }
}

class TempAgencyExtension extends ExtensionBase {
    constructor(extRegistry: IExtensionRegistry) {
        super(extRegistry);

        this.creepRegistry = extRegistry.get(EXT_CreepRegistry) as ICreepRegistryExtensions;
    }

    private creepRegistry: ICreepRegistryExtensions;

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
                PKG: CG_TempAgency,
                sta: ThreadState_Active
            };
        }

        return Memory.TempAgency;
    }

    AssignCreep(creepContext: CreepContext) {
        this.memory.unprocessedCreeps.push(creepContext);
    }
}