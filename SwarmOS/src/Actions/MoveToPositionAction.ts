import { ActionWithPosition } from "Actions/ActionBase";
import * as SwarmEnums from "SwarmEnums";

export class MoveToPositionAction extends ActionWithPosition {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return MoveToPositionAction.SimultaneousActionValue; }
    protected ActionImplemented(): SwarmEnums.CommandResponseType {
        let response: SwarmEnums.CommandResponseType = SwarmEnums.CRT_Move;
        if(this.AssignedCreep.pos.isEqualTo(this.TargetPos)) {
            response = SwarmEnums.CRT_Next;
        }

        return response;
    }
    ValidateAction(): SwarmEnums.CommandResponseType {
        if(this.AssignedCreep.pos.isEqualTo(this.TargetPos)) {
            return SwarmEnums.CRT_Next;
        }
        return SwarmEnums.CRT_None;
    }
}