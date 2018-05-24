import { BasicProcess } from "Core/BasicTypes";
import { BasicCreepGroup } from "CreepGroups/BasicCreepGroup";

export abstract class BasicJob<T extends CreepJob_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    RoomView!: IRoomDataExtension;
    protected abstract GetActionType(): ActionType;
    abstract CheckIsTargetStillValid(): boolean;

    protected GetTargetID(): string | undefined {
        return this.memory.t;
    }
    GetBodyCT(): CT_ALL {
        return this.memory.ct;
    }
    SetBodyCT(newCT: CT_ALL) {
        // (TODO): Handle currently queued spawns
        this.memory.ct = newCT;
    }

    GetBodyLevel(): number {
        return this.memory.lvl;
    }
    SetBodyLevel(newLevel: number) {
        // (TODO): Handle currently queued spawns
        this.memory.lvl = newLevel;
    }
    GetJobState() {
        return this.memory.j;
    }
    StartIfInactive() {
        if (this.memory.j == JobState_Inactive) {
            this.memory.j = JobState_Starting;
        }
    }
    AssignNewTarget(target: Structure | Creep | Source | Mineral | Resource) {
        this.memory.t = target.id;
    }

    protected get creep(): Creep {
        return this._creep!;
    }
    private _creep: Creep | undefined;

    RunThread(): ThreadState {
        if (!this.memory.c && this.memory.j != JobState_Starting) {
            this.memory.j = JobState_Inactive;
            return ThreadState_Done;
        }

        if (this.memory.c) {
            this._creep = this.creepRegistry.tryGetCreep(this.memory.c, this.memory.a || this.pid);
        }
        if (!this.CheckIsTargetStillValid()) {
            return this.HandleMissingTarget();
        }
        if (this.creep && this.creep.spawning) {
            return ThreadState_Done;
        }
        switch (this.GetJobState()) {
            case (JobState_Complete):
                return this.RunState_Complete();
            case (JobState_Running):
                return this.RunState_Running();
            case (JobState_Preparing):
                return this.RunState_Preparing();
            case (JobState_Starting):
                if (!this.memory.c) {
                    let ct = this.GetBodyCT();
                    this.memory.c = this.spawnRegistry.requestSpawn({
                        ct: ct,
                        l: this.GetBodyLevel(),
                        n: ct + GetSUID(),
                    }, this.memory.l, this.memory.p);
                    this.memory.j = JobState_Spawning;
                    this.sleeper.sleep(this.pid, 6); // (TODO): update this to match the length of time for the spawn
                    return ThreadState_Done;
                } else {
                    this.memory.j = JobState_Spawning;
                    return ThreadState_Active;
                }
            case (JobState_Spawning):
                if (this.creep) {
                    this.memory.j = JobState_Preparing;
                    return ThreadState_Active;
                }
                let requestStatus = this.spawnRegistry.getRequestStatus(this.memory.c);
                switch (requestStatus) {
                    case (SP_SPAWNING):
                    case (SP_COMPLETE):
                        let newCreepName = this.spawnRegistry.getRequestContext(this.memory.c)!.n;
                        this.creepRegistry.tryRegisterCreep({ ct: this.GetBodyCT(), l: this.GetBodyLevel(), n: newCreepName });
                        this.creepRegistry.tryReserveCreep(newCreepName, this.pid);
                        let creep = this.creepRegistry.tryGetCreep(newCreepName, this.pid);
                        if (creep) {
                            this.GetParentProcess<BasicCreepGroup<any>>()!.SetCreep(this.memory.id, newCreepName);
                            this.spawnRegistry.cancelRequest(this.memory.c);
                            this.memory.c = newCreepName;
                        }
                        this.memory.j = JobState_Preparing;
                        return ThreadState_Active;
                    case (SP_QUEUED):
                        return ThreadState_Done;
                    case (SP_ERROR):
                    default:
                        delete this.memory.c;
                        this.memory.j = JobState_Starting;
                        return ThreadState_Active;
                }

            case (JobState_Inactive):
            default:
                return ThreadState_Done;
        }
    }

    protected HandleMissingTarget(): ThreadState {
        this.memory.j = JobState_Inactive;
        return ThreadState_Done;
    }

    protected RunState_Preparing(): ThreadState {
        if (!this.creep) {
            // if not, kill the child process and start over
            if (this.memory.a) {
                this.log.info(`KillProcess (BasicJob.RunState_Preparing_1())`);
                this.kernel.killProcess(this.memory.a);
                delete this.memory.a;
            }
            delete this.memory.c;
            this.memory.j = JobState_Inactive;
            return ThreadState_Done;
        }
        // If the creep is full, move on to the next state
        if (this.creep.carry.energy == this.creep.carryCapacity) {
            if (this.memory.a) {
                this.kernel.killProcess(this.memory.a);
                delete this.memory.a;
                // (TODO): Change this to put the thread to sleep until its needed again
            }
            this.memory.j = JobState_Running;
            this.creepRegistry.releaseCreep(this.creep.name);
            this.creepRegistry.tryReserveCreep(this.creep.name, this.pid);
            return ThreadState_Active;
        } else {
            if (this.memory.a) {
                // Double check that the process still exists
                if (this.kernel.getProcessByPID(this.memory.a)) {
                    return ThreadState_Done;
                } else {
                    delete this.memory.a;
                }
            }

            // Or make it
            let target = this.FindNearestEnergyDispenser(this.creep.carryCapacity / 2);
            if (!target) {
                // nothing to retrieve
                return ThreadState_Done;
            }
            let requiredAction: ActionType;
            if ((target as Structure).structureType) {
                requiredAction = AT_Withdraw;
            } else if ((target as Resource).resourceType) {
                requiredAction = AT_Pickup;
            } else if ((target as Source).ticksToRegeneration !== undefined) {
                requiredAction = AT_Harvest;
            } else {
                throw new Error(`Unexpected target for withdrawal`);
            }
            let startCreepMemory: CreepThread_JobMemory = {
                c: this.memory.c,
                a: requiredAction,
                l: this.memory.l,
                t: target.id
            }

            this.memory.a = this.kernel.startProcess(PKG_CreepThread, startCreepMemory);
            this.creepRegistry.releaseCreep(this.memory.c);
            this.creepRegistry.tryReserveCreep(this.memory.c, this.memory.a);
            this.kernel.setParent(this.memory.a, this.pid);
            return ThreadState_Done;
        }
    }

    protected RunState_Running(): ThreadState {
        if (!this.creep) {
            // if not, kill the child process and start over
            if (this.memory.a) {
                this.log.info(`KillProcess (BasicJob.RunState_Running_1())`);
                this.kernel.killProcess(this.memory.a);
                delete this.memory.a;
            }
            delete this.memory.c;
            this.memory.j = JobState_Inactive;
            return ThreadState_Done;
        }
        if (this.creep.carry.energy == 0) {
            this.memory.j = JobState_Preparing;
            if (this.memory.a) {
                this.kernel.killProcess(this.memory.a);
                delete this.memory.a;
            }
            this.creepRegistry.releaseCreep(this.creep.name);
            this.creepRegistry.tryReserveCreep(this.creep.name, this.pid);
            return ThreadState_Active;
        }
        if (this.memory.a) {
            // Double check that the process still exists
            if (this.kernel.getProcessByPID(this.memory.a)) {
                return ThreadState_Done;
            } else {
                delete this.memory.a;
            }
        }
        if (!this.CheckIsTargetStillValid()) {
            this.memory.j = JobState_Inactive;
            if (this.memory.a) {
                this.log.info(`KillProcess (BasicJob.RunState_Running_3())`);
                this.kernel.killProcess(this.memory.a);
                delete this.memory.a;
            }
            return ThreadState_Done;
        }
        let startCreepMemory: CreepThread_JobMemory = {
            c: this.memory.c,
            a: this.GetActionType(),
            l: this.memory.l,
            t: this.memory.t
        }

        this.memory.a = this.kernel.startProcess(PKG_CreepThread, startCreepMemory);
        this.creepRegistry.releaseCreep(this.memory.c);
        this.creepRegistry.tryReserveCreep(this.memory.c, this.memory.a);

        this.kernel.setParent(this.memory.a, this.pid);
        return ThreadState_Done;
    }

    protected RunState_Complete(): ThreadState {
        this.log.info(`KillProcess (BasicJob.RunState_Complete())`);
        this.kernel.killProcess(this.pid);
        this.sleeper.wake(this.parentPID);
        return ThreadState_Done;
    }

    protected FindNearestEnergyDispenser(minEnergy: number = 0): StructureContainer | StructureStorage |
        StructureTerminal | StructureLink | Source | Resource | undefined {
        let view = this.RoomView.GetRoomData(this.creep.room.name)!;
        let closestTarget = undefined;
        let dist = 150;

        for (let i = 0; i < view.resources.length; i++) {
            let resource = Game.getObjectById(view.resources[i]) as Resource
            if (resource && resource.resourceType == RESOURCE_ENERGY) {
                if (resource.amount > minEnergy) {
                    let dist2 = this.creep.pos.getRangeTo(resource.pos);
                    if (dist2 < dist) {
                        closestTarget = resource;
                        dist = dist2;
                    }
                }
            }
        }

        if (closestTarget) {
            return closestTarget;
        }

        if (this.creep.room.storage) {
            let storage = this.creep.room.storage;
            if (storage.store.energy >= 200000) {
                dist = this.creep.pos.getRangeTo(storage);
                closestTarget = storage;
            }
        }
        for (let i = 0; i < view.structures.container.length; i++) {
            let container = Game.getObjectById(view.structures.container[i]) as StructureContainer;
            if (!container) { continue; }
            if (container.store.energy >= minEnergy) {
                let containerDist = this.creep.pos.getRangeTo(container);
                if (containerDist < dist) {
                    dist = containerDist;
                    closestTarget = container;
                }
            }
        }
        if (view.structures.link) {
            for (let i = 0; i < view.structures.link.length; i++) {
                let link = Game.getObjectById(view.structures.link[i]) as StructureLink;
                if (!link) { continue; }
                if (link.energy >= minEnergy) {
                    let linkDist = this.creep.pos.getRangeTo(link);
                    if (linkDist < dist) {
                        dist = linkDist;
                        closestTarget = link;
                    }
                }
            }
        }

        return closestTarget;
    }
}