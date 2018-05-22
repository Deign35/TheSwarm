import { BasicProcess } from "Core/BasicTypes";
import { ActionBase, NoOpAction } from "Actions/ActionBase";
import { WithdrawAction } from "Actions/WithdrawAction";
import { HarvestAction } from "Actions/HarvestAction";
import { PickupAction } from "Actions/PickupAction";
import { SayAction } from "Actions/SayAction";
import { AttackAction } from "Actions/AttackAction";
import { BuildAction } from "Actions/BuildAction";
import { DropAction } from "Actions/DropAction";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { RepairAction } from "Actions/RepairAction";
import { RequestTransferAction } from "Actions/RequestTransfer";
import { TransferAction } from "Actions/TransferAction";
import { UpgradeAction } from "Actions/UpgradeAction";

export class ManualCreepThread<T extends ManualCreep_Memory> extends BasicProcess<T> {
    @extensionInterface(EXT_CreepRegistry)
    protected creepRegistry!: ICreepRegistryExtensions;
    @extensionInterface(EXT_RoomView)
    RoomView!: IRoomDataExtension;

    get CreepName() { return this.memory.c; }

    protected get creep(): Creep {
        return this._creep!;
    }
    protected get target(): RoomObject {
        return this._target;
    }

    private _creep!: Creep;
    private _target!: RoomObject;
    private _actions!: ActionBase[];

    PrepTick(): void {
        this._actions = [];
        let creep = this.creepRegistry.tryGetCreep(this.memory.c, this.pid)!;
        if (!creep) {
            this.kernel.killProcess(this.pid);
            return;
        }
        this._creep = creep;

        let target = Game.getObjectById(this.memory.t) as RoomObject;
        if (!target) {
            this.kernel.killProcess(this.pid);
            return;
        }
        this._target = target;

        if (this.memory.g) {
            if (this.creep.carry.energy == this.creep.carryCapacity) {
                this.memory.t2 = undefined;
                this.memory.g = false;
            }
        } else if (this.creep.carry.energy == 0) {
            this.kernel.killProcess(this.pid);
        }
    }
    EndTick(): void {
        if (this._actions.length == 0) {
            this.log.error(`Creep is not doing anything`);
        }
        for (let i = 0; i < this._actions.length; i++) {
            this._actions[i].Run();
        }
    }

    RunThread(): ThreadState {
        if (!this.creep || this.creep.spawning) {
            return ThreadState_Done;
        }
        if (this.memory.g) {
            return this.getEnergy(this.creep.carryCapacity);
        }

        let action;
        switch (this.memory.a) {
            case (AT_Attack):
                action = new AttackAction(this.creep, this.target as Structure | Creep);
                break;
            case (AT_Build):
                action = new BuildAction(this.creep, this.target as ConstructionSite);
                break;
            case (AT_Drop):
                action = new NoOpAction(this.creep);
                break;
            case (AT_Harvest):
                if (this.creep.carry.energy == this.creep.carryCapacity) {
                    this.kernel.killProcess(this.pid);
                    action = new SayAction(this.creep, 'HarvestComplete');
                } else {
                    action = new HarvestAction(this.creep, this.target as Source | Mineral);
                }
                break;
            case (AT_Pickup):
                action = new PickupAction(this.creep, this.target as Resource);
                break;
            case (AT_Repair):
                if ((this.target as Structure).hits == (this.target as Structure).hitsMax) {
                    this.kernel.killProcess(this.pid);
                    action = new SayAction(this.creep, 'Repair complete');
                } else {
                    action = new RepairAction(this.creep, this.target as Structure);
                }
                break;
            case (AT_RequestTransfer):
                action = new RequestTransferAction(this.creep, this.target as Creep);
                break;
            case (AT_Transfer):
                action = new TransferAction(this.creep, this.target as Structure | Creep);
                break;
            case (AT_Upgrade):
                action = new UpgradeAction(this.creep, this.target as StructureController);
                break;
            case (AT_Withdraw):
                action = new WithdrawAction(this.creep, this.target as StructureContainer);
                break;
            default:
                action = new NoOpAction(this.creep);
        }

        this._actions.push(action);

        return ThreadState_Done;
    }

    protected getEnergy(minEnergy: number = 0): ThreadState {
        let withdrawTarget = undefined;

        if (this.memory.t2) {
            withdrawTarget = Game.getObjectById(this.memory.t2) as StructureStorage | StructureContainer |
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
                    withdrawTarget = undefined;
                }

                if (minEnergy >= available) {
                    this.memory.t2 = undefined;
                    withdrawTarget = undefined;
                }
            }
        }

        if (!withdrawTarget) {
            withdrawTarget = this.FindNearestEnergyDispenser(this.creep.room.name, minEnergy);
            if (!withdrawTarget) {
                this.log.warn(`NO ENERGY!!!!!!!!!!!!!!!!!!!`);
                return ThreadState_Done;
            }
            this.memory.t2 = withdrawTarget.id;
        }

        let action: ActionBase | undefined = undefined;
        if ((withdrawTarget as Structure).structureType) {
            action = new WithdrawAction(this.creep,
                (withdrawTarget as StructureStorage | StructureTerminal | StructureContainer | StructureLink),
                RESOURCE_ENERGY);
        } else if ((withdrawTarget as Source).energyCapacity) {
            action = new HarvestAction(this.creep, (withdrawTarget) as Source);
        } else if ((withdrawTarget as Resource).resourceType) {
            action = new PickupAction(this.creep, withdrawTarget as Resource);
        } else {
            action = new SayAction(this.creep, "I'm confused about my target...");
            this.memory.t2 = undefined;
        }

        this._actions.push(action);
        return ThreadState_Done;
    }

    // (TODO): This needs to be extracted out to a seperate service, perhaps provided by the RoomViewData
    private FindNearestEnergyDispenser(targetRoom: string, minEnergy: number = 0): StructureContainer | StructureStorage |
        StructureTerminal | StructureLink | Source | Resource | undefined {
        let view = this.RoomView.GetRoomData(targetRoom);
        if (!view) {
            this.log.fatal(`This should not be possible`);
            this.kernel.killProcess(this.pid);
            return;
        }
        let closestTarget = undefined;
        let dist = 120;

        for (let i = 0; i < view.resources.length; i++) {
            let resource = Game.getObjectById(view.resources[i]) as Resource
            if (resource && resource.resourceType == RESOURCE_ENERGY) {
                if (resource.amount > minEnergy) {
                    // (TODO): Fix this!
                    closestTarget = resource;
                    return closestTarget;
                }
            }
        }

        if (this.creep.room.storage) {
            let storage = this.creep.room.storage;
            if (storage.store.energy >= minEnergy) {
                dist = this.creep.pos.getRangeTo(storage.pos.x, storage.pos.y);
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
        if (!closestTarget) {
            if (this.creep.getActiveBodyparts(WORK) > 0) {
                for (let i = 0; i < view.sourceIDs.length; i++) {
                    let source = Game.getObjectById(view.sourceIDs[i]) as Source;
                    if (!source) { continue; } // If its cause its in another room.  then what?
                    if (source.energy >= minEnergy) {
                        let sourceDist = this.creep.pos.getRangeTo(source);
                        if (sourceDist < dist) {
                            dist = sourceDist;
                            closestTarget = source;
                        }
                    }
                }
            }
            if (this.creep.room.terminal) {
                let terminal = this.creep.room.terminal;
                if (terminal.store.energy >= minEnergy) {
                    let terminalDist = this.creep.pos.getRangeTo(terminal);
                    if (terminalDist < dist) {
                        dist = terminalDist;
                        closestTarget = terminal;
                    }
                }
            }
        }

        if (!closestTarget) {
            if (this.memory.h != targetRoom) {
                return this.FindNearestEnergyDispenser(this.memory.h, minEnergy);
            } else if (minEnergy > 0) {
                return this.FindNearestEnergyDispenser(this.memory.h, 0);
            }
        }

        return closestTarget;
    }
}