import * as SwarmCodes from "Consts/SwarmCodes";
import * as _ from "lodash";
import { ActionWithTarget } from "Actions/ActionBase";

declare type HarvestTargetType = Source | Mineral;
export class HarvestAction extends ActionWithTarget<HarvestTargetType> {
    static SimultaneousActionValue = 1;
    protected get BlockValue() { return HarvestAction.SimultaneousActionValue; }
    ActionImplemented() {
        let result = this.AssignedCreep.harvest(this.Target);
        let actionResponse: SwarmCodes.SwarmlingResponse = SwarmCodes.C_NONE;
        switch (result) {
            case (OK): actionResponse = SwarmCodes.C_NONE; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            //case(ERR_NOT_FOUND): No extractor on a mineral.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmCodes.E_TARGET_INELLIGIBLE; break;
            //case(ERR_INVALID_TARGET): Target is not a valid harvest object.
            case (ERR_NOT_IN_RANGE): actionResponse = SwarmCodes.C_MOVE; break;
            //case(ERR_NO_BODYPART): No work body parts on this creep.
            default: console.log('FAILED ACTION[HarvestAction] -- ' + result);
        }

        return actionResponse;
    }

    ValidateAction() {
        if (this.AssignedCreep.carryCapacity > 0 && _.sum(this.AssignedCreep.carry) == this.AssignedCreep.carryCapacity) {
            return SwarmCodes.E_ACTION_UNNECESSARY;
        }

        let validTarget = false;
        if ((this.Target as Source).energyCapacity) {
            validTarget = (this.Target as Source).energy > 0;
        } else if ((this.Target as Mineral).mineralAmount) {
            validTarget = (this.Target as Mineral).mineralAmount > 0;
        }

        if (!validTarget) {
            return SwarmCodes.E_TARGET_INELLIGIBLE;
        }

        if (this.AssignedCreep.pos.isNearTo(this.Target.pos)) {
            return SwarmCodes.C_MOVE;
        }
        return SwarmCodes.C_NONE;
    }
}