import { ActionWithPosition } from "Actions/ActionBase";
import * as SwarmEnums from "SwarmEnums";

export class MoveToPositionAction extends ActionWithPosition {
    protected ActionImplemented(): SwarmEnums.CommandResponseType {
        let result = ERR_NOT_IN_RANGE as SwarmEnums.SwarmReturnCode;
        if(this.AssignedCreep.pos.isEqualTo(this.TargetPos)) {
            result = OK;
        }
        let actionResponse: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
        result = this.AssignedCreep.moveTo(this.TargetPos);
        switch(result) {
            case(OK): actionResponse = SwarmEnums.CRT_Next; break;
            case(ERR_NOT_IN_RANGE): actionResponse = SwarmEnums.CRT_Move; break;
        }

        return actionResponse;
    }
    ValidateAction(): SwarmEnums.CommandResponseType {
        return SwarmEnums.CRT_None; // Except ensuring there's a path from A to B.
    }
}