export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        processRegistry.register(PKG_CreepHarvester, Harvester);
    }
}

import { CreepBase } from "Creeps/CreepBase";
import { HarvestAction } from "Actions/HarvestAction";
import { ActionBase } from "Actions/ActionBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { BuildAction } from "Actions/BuildAction";
import { RepairAction } from "Actions/RepairAction";

export class Harvester extends CreepBase<Harvester_Memory> {
    private _updateOffset!: number;
    OnProcessInstantiation() {
        this._updateOffset = GetRandomIndex(primes_3000) || 113
        super.OnProcessInstantiation();
    }

    protected refreshSourceView() {
        if ((Game.time + this._updateOffset) % 61 != 0) {
            return;
        }
        let target = Game.getObjectById(this.memory.tar) as Source | Mineral;
        if ((target as Source).energyCapacity) {
            // Make a link if possible
        } else if ((target as Mineral).mineralType) {
            // Dont spawn if mineral is empty
        }

        if (!this.memory.containerID) {
            let containers = target.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: function (struct: Structure) {
                    return struct.structureType == STRUCTURE_CONTAINER;
                }
            });
            if (containers.length > 0) {
                this.memory.containerID = containers[0].id;
            } else if (!this.memory.constructionSite) {
                let sites = target.pos.findInRange(FIND_CONSTRUCTION_SITES, 1);
                for (let i = 0; i < sites.length; i++) {
                    if (sites[i].structureType == STRUCTURE_CONTAINER) {
                        this.memory.constructionSite = sites[i].id;
                    }
                }
                if (!this.memory.constructionSite) {
                    target.pos.findInRange(FIND_FLAGS, 1);
                    // define what flags do damn it...
                    this.log.warn(`No constructionSite exists.  Harvester unable to see flags.`);
                }
            }
        }
    }

    protected activateCreep(): void {
        this.refreshSourceView();
        let creep = this.creep;
        if (creep.room.name != this.memory.loc) {
            new MoveToPositionAction(creep, new RoomPosition(25, 25, this.memory.loc)).Run();
            return;
        }
        let moveTarget = (Game.getObjectById(this.memory.containerID) as StructureContainer) ||
            (Game.getObjectById(this.memory.constructionSite) as ConstructionSite);
        if (moveTarget) {
            if (!creep.pos.isEqualTo(moveTarget.pos)) {
                new MoveToPositionAction(creep, moveTarget.pos).Run();
            }
        }

        let target = Game.getObjectById(this.memory.tar) as Source | Mineral;
        if (!target) {
            new MoveToPositionAction(creep, new RoomPosition(25, 25, this.memory.loc)).Run();
            return;
        }

        let action: ActionBase = new HarvestAction(creep, target);
        switch (action.ValidateAction()) {
            case (SR_NONE):
            case (SR_MOVE):
                break;
            case (SR_TARGET_INELLIGIBLE): // Target is empty.
            case (SR_ACTION_UNNECESSARY): // Creep's carry is full
            default:
                let hasReplacementAction = false;
                if (creep.carry.energy > 0) {
                    if (this.memory.constructionSite) {
                        let site = Game.getObjectById(this.memory.constructionSite) as ConstructionSite;
                        if (site) {
                            hasReplacementAction = true;
                            action = new BuildAction(creep, site);
                        }
                    } else if (this.memory.containerID) {
                        let container = Game.getObjectById(this.memory.containerID) as StructureContainer;
                        if (container && container.hits < container.hitsMax) {
                            hasReplacementAction = true;
                            action = new RepairAction(creep, container);
                        }
                    }
                }

                if (hasReplacementAction && action.ValidateAction() != SR_NONE) {
                    this.log.fatal(`Action unable to occur for an unexpected reason -- ${action.ValidateAction()}`);
                    this.kernel.killProcess(this.pid);
                    break;
                }
        }

        action.Run(!moveTarget);
    }
}