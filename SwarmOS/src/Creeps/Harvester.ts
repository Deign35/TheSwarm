import { BaseCreepProcess } from "./BaseCreepProcess";
import { HarvestAction } from "Actions/HarvestAction";
import { ActionBase } from "Actions/ActionBase";

export class Harvester extends BaseCreepProcess<Harvester_Memory> {
    protected activateCreep(): void {
        let creep = Game.creeps[this.memory.creep!];
        if (!creep) {
            // This should never happen
            this.log.fatal(`Creep activation occurred without an assigned creep`);
            this.memory.creep = undefined;
            return;
        }

        let target = Game.getObjectById(this.memory.targetID) as Source | Mineral;
        let action: ActionBase = new HarvestAction(creep, target);

        switch (action.ValidateAction()) {
            case (E_ACTION_UNNECESSARY):
                break;
            case (E_TARGET_INELLIGIBLE):
                break;
            case (C_MOVE):
                break;
            case (C_NONE):
                break;
        }
    }
}