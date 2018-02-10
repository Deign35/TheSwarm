import { ActionWithTarget } from "Actions/ActionBase";
import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";

export class PickupAction extends ActionWithTarget<Resource> {
    protected ActionImplemented(): SwarmEnums.CommandResponseType {
        let result = this.AssignedCreep.pickup(this.Target);
        let actionResponse: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
        switch(result) {
            case(OK): actionResponse = SwarmEnums.CRT_Condition_Full; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            //case(ERR_INVALID_TARGET): Target is not a valid constructionsite.
            case(ERR_FULL): actionResponse = SwarmEnums.CRT_Next; break;
            case(ERR_NOT_IN_RANGE): actionResponse = SwarmEnums.CRT_Move; break;
        }

        return actionResponse;
    }
    ValidateAction(): SwarmEnums.CommandResponseType {
        if(_.sum(this.AssignedCreep.carry) == this.AssignedCreep.carryCapacity) {
            return SwarmEnums.CRT_Next;
        }
        return SwarmEnums.CRT_None;
    }
}