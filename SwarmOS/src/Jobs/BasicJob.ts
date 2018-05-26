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
    get JobState() {
        return this.memory.j;
    }
    set JobState(state: JobState) {
        if (state == JobState_Running) {
            this.memory.co = this.memory.t;
            this.memory.ca = this.GetActionType();
        } else {
            this.memory.co = undefined;
            this.memory.ca = undefined;
        }
        this.memory.j = state;
    }
    StartIfInactive() {
        if (this.JobState == JobState_Inactive) {
            this.JobState = JobState_Starting;
        }
    }
    AssignNewTarget(targetID: string) {
        this.memory.t = targetID;
    }

    protected get creep(): Creep {
        return this._creep!;
    }
    private _creep: Creep | undefined;

    PrepTick() {
        if (!this.memory.c && this.JobState > JobState_Starting) {
            this.JobState = JobState_Inactive;
        }

        if (this.memory.c) {
            this._creep = this.creepRegistry.tryGetCreep(this.memory.c, this.pid);
            if (this.creep) {
                if (this.JobState < JobState_Preparing && this.JobState != JobState_Inactive) {
                    this.JobState = JobState_Preparing;
                }
            }
        }
    }

    RunThread(): ThreadState {
        if (this.JobState == JobState_Inactive) {
            return ThreadState_Done;
        }
        if (!this.CheckIsTargetStillValid()) {
            return this.HandleMissingTarget();
        }
        if (this.creep && this.creep.spawning) {
            return ThreadState_Done;
        }
        switch (this.JobState) {
            case (JobState_Complete):
                if (!this.creep) {
                    this.JobState = JobState_Inactive;
                    return ThreadState_Done;
                }
                return this.RunState_Complete();
            case (JobState_Running):
                if (!this.creep) {
                    this.JobState = JobState_Inactive;
                    return ThreadState_Done;
                }
                return this.RunState_Running();
            case (JobState_Preparing):
                if (!this.creep) {
                    this.JobState = JobState_Inactive;
                    return ThreadState_Done;
                }
                return this.RunState_Preparing();
            case (JobState_Starting):
                if (!this.memory.c) {
                    let ct = this.GetBodyCT();
                    this.memory.c = this.spawnRegistry.requestSpawn({
                        ct: ct,
                        l: this.GetBodyLevel(),
                        n: ct + GetSUID(),
                    }, this.memory.l, this.memory.p);
                    this.JobState = JobState_Spawning;
                    this.sleeper.sleep(this.pid, 6); // (TODO): update this to match the length of time for the spawn
                    return ThreadState_Done;
                }
            case (JobState_Spawning):
                if (this.creep) {
                    this.JobState = JobState_Preparing;
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
                            this._creep = creep;
                        }
                        this.JobState = JobState_Preparing;
                        return ThreadState_Active;
                    case (SP_QUEUED):
                        return ThreadState_Done;
                    case (SP_ERROR):
                    default:
                        delete this.memory.c;
                        this.JobState = JobState_Inactive;
                        return ThreadState_Active;
                }
            default:
                return ThreadState_Done;
        }
    }

    protected HandleMissingTarget(): ThreadState {
        this.JobState = JobState_Inactive;
        return ThreadState_Done;
    }

    protected RunState_Preparing(): ThreadState {
        // If the creep is full, move on to the next state
        if (this.creep.carry.energy == this.creep.carryCapacity) {
            this.JobState = JobState_Running;
            return ThreadState_Active;
        } else {
            let target = this.memory.co ? Game.getObjectById(this.memory.co) : undefined;
            if (!target) {
                target = this.FindNearestEnergyDispenser(this.creep.carryCapacity / 2);
                if (!target) {
                    return ThreadState_Done;
                }
                let requiredAction: ActionType;
                if ((target as Structure).structureType || (target as Tombstone).deathTime) {
                    requiredAction = AT_Withdraw;
                } else if ((target as Resource).resourceType) {
                    requiredAction = AT_Pickup;
                } else if ((target as Source).ticksToRegeneration !== undefined) {
                    requiredAction = AT_Harvest;
                } else {
                    throw new Error(`Unexpected target for withdrawal`);
                }

                this.memory.ca = requiredAction;
                this.memory.co = (target as Structure).id;
            }
            let action = GetBasicAction(this.creep, this.memory.ca!, target as RoomObject);

            if (action) {
                action.Run();
            } else {
                this.log.warn(`UNEXPECTED--Action not working1`);
            }
            return ThreadState_Done;
        }
    }

    protected RunState_Running(): ThreadState {
        if (this.creep.carry.energy == 0) {
            this.JobState = JobState_Preparing;
            return ThreadState_Active;
        }
        if (!this.CheckIsTargetStillValid()) {
            this.JobState = JobState_Inactive;
            return ThreadState_Done;
        }
        let target = Game.getObjectById(this.memory.co);
        if (!target) {
            this.kernel.killProcess(this.pid, `BasicJob's objective has disappeared, closing job`);
            return ThreadState_Done;
        }
        let action = GetBasicAction(this.creep, this.memory.ca!, target as RoomObject);

        if (action) {
            action.Run();
        } else {
            this.log.warn(`UNEXPECTED--Action not working2`);
        }
        return ThreadState_Done;
    }

    protected RunState_Complete(): ThreadState {
        this.kernel.killProcess(this.pid, `KillProcess (BasicJob.RunState_Complete())`);
        this.sleeper.wake(this.parentPID);
        return ThreadState_Done;
    }

    protected FindNearestEnergyDispenser(minEnergy: number = 0): StructureContainer | StructureStorage |
        StructureTerminal | StructureLink | Source | Resource | Tombstone | undefined {
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

        for (let i = 0; i < view.tombstones.length; i++) {
            let tombstone = Game.getObjectById(view.tombstones[i]) as Tombstone;
            if (tombstone && (tombstone.store.energy || 0) >= minEnergy) {
                let dist2 = this.creep.pos.getRangeTo(tombstone.pos);
                if (dist2 < dist) {
                    closestTarget = tombstone;
                    dist = dist2;
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


import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase } from "Actions/ActionBase";
import { UpgradeAction } from "Actions/UpgradeAction";
import { BuildAction } from "Actions/BuildAction";
import { PickupAction } from "Actions/PickupAction";
import { RepairAction } from "Actions/RepairAction";
import { TransferAction } from "Actions/TransferAction";
import { WithdrawAction } from "Actions/WithdrawAction";
import { HarvestAction } from "Actions/HarvestAction";
import { RequestTransferAction } from "Actions/RequestTransfer";
const GetBasicAction = function (creep: Creep, actionType: ActionType, target: RoomObject | Creep): ActionBase | undefined {
    switch (actionType) {
        case (AT_Build):
            return new BuildAction(creep, target as ConstructionSite);
        case (AT_Harvest):
            return new HarvestAction(creep, target as Source);
        case (AT_RequestTransfer):
            return new RequestTransferAction(creep, target as Creep);
        case (AT_Pickup):
            return new PickupAction(creep, target as Resource);
        case (AT_Repair):
            return new RepairAction(creep, target as Structure);
        case (AT_Transfer):
            return new TransferAction(creep, target as Structure | Creep);
        case (AT_Upgrade):
            return new UpgradeAction(creep, target as StructureController);
        case (AT_Withdraw):
            return new WithdrawAction(creep, target as StructureContainer);
        default:
            return undefined;
    }
}