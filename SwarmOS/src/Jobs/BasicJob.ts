import { BasicProcess } from "Core/BasicTypes";

export abstract class BasicJob<T extends BasicJob_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    protected View!: IRoomDataExtension;

    private _curAction!: ActionType;
    protected abstract GetPrimaryActionType(): ActionType;
    protected GetActionType(): ActionType {
        return this.memory.ac;
    }
    protected GetTarget(): ObjectTypeWithID | undefined {
        return Game.getObjectById(this.memory.tar) as ObjectTypeWithID;
    }
    protected UpdateTarget() {
        let parent = this.kernel.getProcessByPID(this.parentPID)! as (IProcess & {
            GetAssignmentTarget: (id: string) => string;
        });
        if (parent && parent.GetAssignmentTarget) {
            let updTar = parent.GetAssignmentTarget(this.memory.id);
            if (this.memory.tar && this.memory.tar == this.memory.obj) {
                this.memory.tar = updTar;
            }
            this.memory.obj = updTar;
        }
    }

    GetBodyCT(): CT_ALL {
        return this.memory.ct;
    }
    SetBodyCT(newCT: CT_ALL) {
        if (this.memory.ct != newCT) {
            if (this.memory.isSpawning) {
                let spawnStatus = this.spawnRegistry.getRequestStatus(this.memory.cID);
                if (spawnStatus && (spawnStatus == SP_QUEUED)) {
                    this.spawnRegistry.cancelRequest(this.memory.cID);
                    delete this.memory.cID;
                    this.sleeper.wake(this.pid);
                }
            }
            this.memory.ct = newCT;
        }
    }
    GetBodyLevel(): number {
        return this.memory.lvl;
    }
    SetBodyLevel(newLevel: number) {
        if (this.memory.lvl != newLevel) {
            if (this.memory.isSpawning) {
                let spawnStatus = this.spawnRegistry.getRequestStatus(this.memory.cID);
                if (spawnStatus && (spawnStatus == SP_QUEUED)) {
                    this.spawnRegistry.cancelRequest(this.memory.cID);
                    delete this.memory.cID;
                    this.sleeper.wake(this.pid);
                }
            }
            this.memory.lvl = newLevel;
        }
    }

    protected get creep(): Creep {
        return this._creep!;
    }
    private _creep: Creep | undefined;

    ReleaseCreep() {
        this.spawnRegistry.cancelRequest(this.memory.cID);
        this.creepRegistry.releaseCreep(this.memory.cID, this.pid);
    }

    PrepTick() {
        if (this.memory.cID) {
            this._creep = this.creepRegistry.tryGetCreep(this.memory.cID, this.pid);
        }
        if (!this.creep) {
            if (this.memory.cID) {
                if (this.memory.isSpawning) {
                    let spawnStatus = this.spawnRegistry.getRequestStatus(this.memory.cID);
                    switch (spawnStatus) {
                        case (SP_QUEUED): break;;
                        case (SP_SPAWNING):
                        case (SP_COMPLETE):
                            let newCreepName = this.spawnRegistry.getRequestContext(this.memory.cID)!.n;
                            this.creepRegistry.tryRegisterCreep({ ct: this.GetBodyCT(), l: this.GetBodyLevel(), n: newCreepName });
                            this.creepRegistry.tryReserveCreep(newCreepName, this.pid);
                            let creep = this.creepRegistry.tryGetCreep(newCreepName, this.pid);
                            if (creep) {
                                this.spawnRegistry.cancelRequest(this.memory.cID);
                                this.memory.cID = newCreepName;
                                delete this.memory.isSpawning;
                                this._creep = creep;
                            } else if (spawnStatus == SP_COMPLETE) {
                                this.spawnRegistry.cancelRequest(this.memory.cID);
                                delete this.memory.isSpawning;
                                delete this.memory.cID;
                            }
                            break;
                        case (SP_ERROR):
                            this.spawnRegistry.cancelRequest(this.memory.cID);
                        default:
                            delete this.memory.cID;
                            delete this.memory.isSpawning;
                            break;
                    }
                } else {
                    // dead creep?
                    if (this.memory.expires) {
                        this.ReleaseCreep();
                        this.kernel.killProcess(this.pid, `Job complete`);
                    }
                    delete this.memory.cID;
                }
            }
        }

        if (!this.memory.cID) {
            let ct = this.GetBodyCT();
            this.memory.cID = this.spawnRegistry.requestSpawn({
                ct: ct,
                l: this.GetBodyLevel(),
                n: ct + GetSUID(),
            }, this.memory.loc, this.memory.pri);
            this.memory.isSpawning = true;
        }
    }

    RunThread(): ThreadState {
        if (!this.creep || this.creep.spawning) {
            return ThreadState_Done;
        }

        if (!this.GetTarget()) {
            if (!this.memory.ret) {
                this.UpdateTarget();
            }
            if (!this.GetTarget()) {
                let newTarget = this.GetNewTarget();
                if (newTarget && !!Game.getObjectById(newTarget)) {
                    if (this.memory.obj == this.memory.tar) {
                        this.memory.tar = newTarget;
                    }
                    this.memory.obj = newTarget;
                }
            }
        }

        return this.SetupAction();
    }

    EndTick() {
        let target = this.GetTarget();
        if (this.creep && !this.creep.spawning && target) {
            let action = GetBasicAction(this.creep, this.GetActionType(), target);
            if (action) {
                action.Run();
            } else {
                this.log.warn(`UNEXPECTED--Action not working`);
            }
        }
    }

    protected SetupAction(): ThreadState {
        if (this.memory.ac == AT_NoOp) {
            this.memory.ret = true;
            delete this.memory.tar;
            delete this.memory.ac;
        }
        if (this.memory.ret) {
            if (this.creep.carry.energy == this.creep.carryCapacity) {
                delete this.memory.ret;
                this.memory.ac = this.GetPrimaryActionType();
                this.memory.tar = this.memory.obj;
                return ThreadState_Done;
            } else {
                if (this.memory.tar) {
                    // Do something to ensure I can path to the location
                    let curTar = this.GetTarget() as Resource | StructureStorage | StructureContainer | StructureTerminal | Tombstone | Source | StructureLink;
                    if (curTar && curTar.energy! > 0) {
                        return ThreadState_Done;
                    } else {
                        delete this.memory.tar;
                    }
                }
                if (!this.memory.tar) {
                    let target = this.FindNearestEnergyDispenser(this.creep.carryCapacity / 2);
                    if (!target) {
                        return ThreadState_Done;
                    }
                    let requiredAction: ActionType;
                    if ((target as Structure).structureType || (target as Tombstone).deathTime) {
                        requiredAction = AT_Withdraw;
                    } else if ((target as Resource).resourceType) {
                        requiredAction = AT_Pickup;
                    } else if ((target as Source).energyCapacity !== undefined) {
                        requiredAction = AT_Harvest;
                    } else {
                        throw new Error(`Unexpected target for withdrawal`);
                    }

                    this.memory.ac = requiredAction;
                    this.memory.tar = (target as Structure).id;
                    return ThreadState_Done;
                }
            }
        } else {
            if (this.creep.carry.energy == 0) {
                this.memory.ret = true;
                delete this.memory.ac;
                delete this.memory.tar;
                return ThreadState_Active;
            }
        }
        return ThreadState_Done;
    }

    protected GetNewTarget(): string | undefined {
        let viewData = this.View.GetRoomData(this.memory.loc)!;
        switch (this.memory.tt) {
            case (TT_Builder):
                // (TODO): Create a priority for constructionsites.
                if (viewData.cSites.length > 0) {
                    let bestSite = undefined;
                    let orderVal = 0;
                    for (let i = 0; i < viewData.cSites.length; i++) {
                        let cSite = Game.getObjectById(viewData.cSites[i]) as ConstructionSite;
                        if (!cSite) {
                            continue;
                        }

                        switch (cSite.structureType) {
                            case (STRUCTURE_CONTAINER):
                                if (orderVal < 3) {
                                    bestSite = cSite;
                                    orderVal = 3;
                                }
                                break;
                            case (STRUCTURE_EXTENSION):
                                if (orderVal < 6) {
                                    bestSite = cSite;
                                    orderVal = 6;
                                }
                                break;
                            case (STRUCTURE_LAB):
                                if (orderVal < 4) {
                                    bestSite = cSite;
                                    orderVal = 4;
                                }
                                break;
                            case (STRUCTURE_ROAD):
                                if (orderVal < 7) {
                                    bestSite = cSite;
                                    orderVal = 7;
                                }
                                break;
                            case (STRUCTURE_SPAWN):
                                if (orderVal < 5) {
                                    bestSite = cSite;
                                    orderVal = 5;
                                }
                                break;
                            case (STRUCTURE_TOWER):
                                if (orderVal < 8) {
                                    bestSite = cSite;
                                    orderVal = 8;
                                }
                                break;
                        }
                    }
                    return bestSite ? bestSite.id : undefined;
                }
                break;
            case (TT_Repair):
                if (viewData.needsRepair.length > 0) {
                    return viewData.needsRepair.shift()!;
                }
                break;
            case (TT_SupportFiller):
                if (viewData.structures.tower) {
                    for (let i = 0; i < viewData.structures.tower.length; i++) {
                        let tower = Game.getObjectById(viewData.structures.tower[i]) as StructureTower;
                        if (tower && tower.energy < tower.energyCapacity) {
                            return tower.id;
                        }
                    }
                }

                let ids = Object.keys(Game.creeps);
                for (let i = 0; i < ids.length; i++) {
                    let creep = Game.creeps[ids[i]];
                    if (creep.memory.ct == CT_Worker && (creep.carry.energy * 4) < creep.carryCapacity) {
                        return creep.id;
                    }
                }
            // SupportFiller will help out with spawn filling if no other work is nearby
            case (TT_SpawnRefill):
                if (!viewData.structures.extension || !viewData.structures.spawn) {
                    return;
                }
                for (let i = 0; i < viewData.structures.extension.length; i++) {
                    let extension = Game.getObjectById(viewData.structures.extension[i]) as StructureExtension;
                    if (extension && extension.energy < extension.energyCapacity) {
                        return extension.id;
                    }
                }
                for (let i = 0; i < viewData.structures.spawn.length; i++) {
                    let spawn = Game.getObjectById(viewData.structures.spawn[i]) as StructureSpawn;
                    if (spawn && spawn.energy < spawn.energyCapacity) {
                        return spawn.id;
                    }
                }
                if (this.creep.getActiveBodyparts(WORK) == 0) {
                    return undefined;
                }
            // If the creep has a work part, it will then dump its transfer into the controller (yay for creep.transfer working on the controller)
            case (TT_Upgrader):
                return viewData.structures.controller;
            case (TT_Harvest):
                return viewData.sourceIDs.length > 0 ? viewData.sourceIDs[0] : undefined;
            case (TT_None):
            default:
                break;
        }
        return;
    }

    protected FindNearestEnergyDispenser(minEnergy: number = 0): StructureContainer | StructureStorage |
        StructureTerminal | StructureLink | Source | Resource | Tombstone | undefined {
        let view = this.View.GetRoomData(this.creep.room.name)!;
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
        if (!closestTarget && this.creep.getActiveBodyparts(WORK) > 0) {
            for (let i = 0; i < view.sourceIDs.length; i++) {
                let source = Game.getObjectById(view.sourceIDs[i]) as Source;
                if (source.energy >= minEnergy) {
                    let sourceDist = this.creep.pos.getRangeTo(source);
                    if (sourceDist < dist) {
                        dist = sourceDist;
                        closestTarget = source;
                    }
                }
            }
        }

        return closestTarget;
    }
}

import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { ActionBase, NoOpAction } from "Actions/ActionBase";
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
        case (AT_NoOp):
            return new NoOpAction(creep);
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