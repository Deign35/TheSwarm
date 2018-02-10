import { ActionWithTarget } from "Actions/ActionBase";
import * as SwarmEnums from "SwarmEnums";

export class RepairAction extends ActionWithTarget<Structure> {
    protected ActionImplemented(): SwarmEnums.CommandResponseType {
        let result = this.AssignedCreep.repair(this.Target);
        let actionResponse: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
        switch(result) {
            case(OK): actionResponse = SwarmEnums.CRT_Condition_Empty; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case(ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmEnums.CRT_Next; break;
            //case(ERR_INVALID_TARGET): Target is not a valid constructionsite.
            case(ERR_NOT_IN_RANGE): actionResponse = SwarmEnums.CRT_Move; break;
            //case(ERR_NO_BODYPART): No work body parts on this creep.
        }

        return actionResponse;
    }
    protected ValidateAction(): SwarmEnums.CommandResponseType {
        // Sum!
        if(this.AssignedCreep.carry.energy == 0) {
            return SwarmEnums.CRT_Next as SwarmEnums.CommandResponseType;
        } else if(this.Target.hits == this.Target.hitsMax) {
            return SwarmEnums.CRT_NewTarget;
        }
        return SwarmEnums.CRT_None;
    }
}