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
import { BasicProcess } from "Core/BasicTypes";

export abstract class EasyCreep<T extends CreepThread_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    RoomView!: IRoomDataExtension;

    protected get creep(): Creep {
        return this._creep!;
    }
    private _creep: Creep | undefined;
    PrepTick(): void {
        if (this.memory.c) {
            this._creep = this.creepRegistry.tryGetCreep(this.memory.c, this.pid);
            if (!this._creep) {
                this.kernel.killProcess(this.pid);
                return;
            }
        }
    }
    protected abstract GetActionType(): ActionType;

    protected GetTargetID(): string | undefined {
        return this.memory.t;
    }
    protected GetBasicAction(actionType: ActionType, target: RoomObject | Creep) {
        switch (actionType) {
            case (AT_Build):
                return new BuildAction(this.creep, target as ConstructionSite);
            case (AT_Harvest):
                return new HarvestAction(this.creep, target as Source);
            case (AT_RequestTransfer):
                return new RequestTransferAction(this.creep, target as Creep);
            case (AT_Pickup):
                return new PickupAction(this.creep, target as Resource);
            case (AT_Repair):
                return new RepairAction(this.creep, target as Structure);
            case (AT_Transfer):
                return new TransferAction(this.creep, target as Structure | Creep);
            case (AT_Upgrade):
                return new UpgradeAction(this.creep, target as StructureController);
            case (AT_Withdraw):
                return new WithdrawAction(this.creep, target as StructureContainer);
            default:
                return undefined;
        }
    }

    protected RunAction(actionType: ActionType, id: string) {
        let target = Game.getObjectById(id) as RoomObject | Creep;
        if (!target) {
            this.kernel.killProcess(this.pid);
            return;
        }

        let action: ActionBase | undefined = this.GetBasicAction(this.GetActionType(), target);

        if (action) {
            action.Run();
        } else {
            this.log.error(`EasyCreep action not found ${this.creep.name} -- pid(${this.pid} -- actoin${this.GetActionType()}`);
            this.kernel.killProcess(this.pid);
        }
    }
    RunThread(): ThreadState {
        if (!this.creep || this.creep.spawning) {
            return ThreadState_Done;
        }

        if (this.creep.room.name != this.memory.l) {
            new MoveToPositionAction(this.creep, new RoomPosition(25, 25, this.memory.l)).Run();
            return ThreadState_Done;
        }

        if (this.memory.t2) {
            if (this.creep.carry.energy == this.creep.carryCapacity) {
                this.memory.t2 = undefined;
            }
        } else if (this.creep.carry.energy == 0 && !this.memory.t2) {
            if (this.memory.n !== undefined) {
                if (this.memory.n == 0) {
                    this.kernel.killProcess(this.pid);
                    return ThreadState_Done;
                }
                this.memory.n--;
            }
            let resTarget = this.FindNearestEnergyDispenser(this.creep.room.name, this.creep.carryCapacity / 2);
            if (resTarget) {
                this.memory.t2 = resTarget.id;
            } else {
                this.kernel.killProcess(this.pid);
                return ThreadState_Done;
            }
        }

        if (this.memory.t2) {
            if (this.creep.room.name != this.memory.h) {
                new MoveToPositionAction(this.creep, new RoomPosition(25, 25, this.memory.h)).Run();
                return ThreadState_Done;
            }
        } else if (this.creep.room.name != this.memory.l) {
            new MoveToPositionAction(this.creep, new RoomPosition(25, 25, this.memory.l)).Run();
            return ThreadState_Done;
        }

        if (this.memory.t2) {
            return this.getEnergy(this.creep.carryCapacity / 2);
        }

        let targetID = this.GetTargetID();
        if (!targetID) {
            this.kernel.killProcess(this.pid);
            return ThreadState_Done;
        }
        this.RunAction(this.GetActionType(), targetID);

        return ThreadState_Done;
    }

    protected getEnergy(minEnergy: number = 0): ThreadState {
        let withdrawTarget = Game.getObjectById(this.memory.t2) as StructureStorage | StructureContainer |
            StructureLink | Source | StructureTerminal | Resource;
        if (!withdrawTarget) {
            this.memory.t2 = undefined;
        } else {
            let available = 0;
            if ((withdrawTarget as StructureStorage).storeCapacity) {
                available = (withdrawTarget as StructureStorage).store.energy;
            } else if ((withdrawTarget as StructureLink).energyCapacity) {
                available = (withdrawTarget as Source).energy;
            } else if ((withdrawTarget as Resource).resourceType == RESOURCE_ENERGY) {
                available = (withdrawTarget as Resource).amount;
            } else {
                this.log.fatal(`Withdraw target unexpected ${JSON.stringify(withdrawTarget)}`);
                this.memory.t2 = undefined;
            }

            if (available == 0) {
                this.memory.t2 = undefined;
            }
        }

        if (!this.memory.t2) {
            return ThreadState_Active;
        }
        let action: ActionBase | undefined = undefined;
        if ((withdrawTarget as Structure).structureType) {
            this.RunAction(AT_Withdraw, this.memory.t2!);
        } else if ((withdrawTarget as Source).energyCapacity) {
            this.RunAction(AT_Withdraw, this.memory.t2!);
        } else if ((withdrawTarget as Resource).resourceType) {
            this.RunAction(AT_Withdraw, this.memory.t2!);
        } else {
            this.memory.t2 = undefined;
            return ThreadState_Active;
        }
        return ThreadState_Done;
    }

    protected FindNearestEnergyDispenser(targetRoom: string, minEnergy: number = 0): StructureContainer | StructureStorage |
        StructureTerminal | StructureLink | Source | Resource | undefined {
        let view = this.RoomView.GetRoomData(targetRoom);
        if (!view) {
            this.log.fatal(`This should not be possible`);
            this.kernel.killProcess(this.pid);
            return;
        }
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