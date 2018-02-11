import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";
import { ActionWithTarget } from "Actions/ActionBase";

export class UpgradeAction extends ActionWithTarget<StructureController> {
    ActionImplemented() {
        let result = this.AssignedCreep.upgradeController(this.Target);
        let actionResponse: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
        switch (result) {
            case (OK): actionResponse = SwarmEnums.CRT_Condition_Empty; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmEnums.CRT_Next; break;
            //case(ERR_INVALID_TARGET): Target is not a valid transfer object.
            case (ERR_NOT_IN_RANGE): actionResponse = SwarmEnums.CRT_Move; break;
            //case(ERR_NO_BODYPART): No work body parts on this creep.
        }

        return actionResponse;
    }

    ValidateAction() {
        let result = SwarmEnums.CRT_None;
        if (this.AssignedCreep.carry.energy == 0) {
            result = SwarmEnums.CRT_Next;
        }
        return result as SwarmEnums.CommandResponseType;
    }
}