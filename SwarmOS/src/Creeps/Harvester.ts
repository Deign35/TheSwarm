import { ProcessBase, ExtensionBase } from "Core/BasicTypes";

export const IN_CREEP_HARVESTER = 'Creep/Roles/Harvester';

export const bundle: IPosisBundle<SpawnData_Memory> = {
    install(processRegistry: IPosisProcessRegistry, extensionRegistry: IPosisExtensionRegistry) {
        processRegistry.register(IN_CREEP_HARVESTER, Harvester);
    },
    rootImageName: IN_CREEP_HARVESTER
}

import { BaseCreepProcess } from "./BaseCreepProcess";
import { HarvestAction } from "Actions/HarvestAction";
import { ActionBase } from "Actions/ActionBase";
import { MoveToPositionAction } from "Actions/MoveToPositionAction";
import { BuildAction } from "Actions/BuildAction";
import { RepairAction } from "Actions/RepairAction";

export class Harvester extends BaseCreepProcess<Harvester_Memory> {
    protected activateCreep(): void {
        let creep = Game.creeps[this.memory.creep!];
        if (!creep) {
            // This should never happen
            this.log.fatal(`Creep activation occurred without an assigned creep`);
            this.memory.creep = undefined;
            return;
        }
        if (creep.spawning) {
            this.log.debug(`Harvester Creep is spawning(${this.imageName}[${this.pid}])`);
            return;
        }
        let moveTarget = (Game.getObjectById(this.memory.containerID) as StructureContainer);
        if (moveTarget) {
            if (!creep.pos.isEqualTo(moveTarget.pos)) {
                new MoveToPositionAction(creep, moveTarget.pos).Run(true);
                return;
            }
        }

        let target = Game.getObjectById(this.memory.targetID) as Source | Mineral;
        let action: ActionBase = new HarvestAction(creep, target);
        switch (action.ValidateAction()) {
            case (C_NONE): break;
            case (C_MOVE):
                this.log.fatal(`Harvest position is out of range of the target`);
                this.kernel.killProcess(this.pid);
                return;
            case (E_TARGET_INELLIGIBLE): // Target is empty.  (TODO) let it still try to build or repair
            case (E_ACTION_UNNECESSARY): // Creep's carry is full
            default:
                if (creep.carry.energy > 0) {
                    if (this.memory.constructionSite) {
                        action = new BuildAction(creep, Game.getObjectById(this.memory.constructionSite) as ConstructionSite);
                    } else if (this.memory.containerID) {
                        let container = Game.getObjectById(this.memory.containerID) as StructureContainer;
                        if (container && container.hits < container.hitsMax) {
                            action = new RepairAction(creep, container);
                        }
                    }
                }

                if (action.ValidateAction() != C_NONE) {
                    this.log.fatal(`Action unable to occur for an unexpected reason -- ${action.ValidateAction()}`);
                    this.kernel.killProcess(this.pid);
                    break;
                }
        }

        action.Run();
    }
}