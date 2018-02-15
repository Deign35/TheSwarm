import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";
import { ActionWithTarget } from "Actions/ActionBase";

declare type HarvestTargetType = Source | Mineral;
export class HarvestAction extends ActionWithTarget<HarvestTargetType> {
    static SimultaneousActionValue = 1;
    protected get BlockValue() { return HarvestAction.SimultaneousActionValue; }
    ActionImplemented() {
        let result = this.AssignedCreep.harvest(this.Target);
        let actionResponse: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
        switch (result) {
            case (OK): actionResponse = SwarmEnums.CRT_Condition_Full; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            //case(ERR_NOT_FOUND): No extractor on a mineral.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmEnums.CRT_NewTarget; break;
            //case(ERR_INVALID_TARGET): Target is not a valid harvest object.
            case (ERR_NOT_IN_RANGE): actionResponse = SwarmEnums.CRT_Move; break;
            //case(ERR_NO_BODYPART): No work body parts on this creep.
        }

        return actionResponse;
    }

    ValidateAction() {
        if (_.sum(this.AssignedCreep.carry) == this.AssignedCreep.carryCapacity) {
            return SwarmEnums.CRT_Next as SwarmEnums.CommandResponseType;
        }

        let validTarget = false;
        if ((this.Target as Source).energy) {
            validTarget = (this.Target as Source).energy > 0;
        } else if ((this.Target as Mineral).mineralAmount) {
            validTarget = (this.Target as Mineral).mineralAmount > 0;
        }
        return (validTarget ? SwarmEnums.CRT_None : SwarmEnums.CRT_NewTarget);
    }
}