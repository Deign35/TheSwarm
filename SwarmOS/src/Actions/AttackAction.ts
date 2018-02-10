import { ActionWithTarget } from "Actions/ActionBase";
import * as SwarmEnums from "SwarmEnums";

export class AttackAction extends ActionWithTarget<Creep | Structure> {
    protected ActionImplemented(): SwarmEnums.CommandResponseType {
        let result = this.AssignedCreep.attack(this.Target);
        let actionResponse: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
        switch(result) {
            //case(OK): actionResponse = SwarmEnums.CRT_None; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            //case(ERR_INVALID_TARGET): Target is not a valid attackable object.
            case(ERR_NOT_IN_RANGE): actionResponse = SwarmEnums.CRT_Move; break;
            //case(ERR_NO_BODYPART): No attack body parts on this creep.
        }

        return actionResponse;
    }
    ValidateAction(): SwarmEnums.CommandResponseType { return SwarmEnums.CRT_None; }
}