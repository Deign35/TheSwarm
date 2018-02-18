import { ActionWithPosition } from "Actions/ActionBase";
import * as SwarmCodes from "Consts/SwarmCodes";

export class MoveToPositionAction extends ActionWithPosition {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return MoveToPositionAction.SimultaneousActionValue; }
    protected ActionImplemented(): SwarmCodes.SwarmlingResponse {
        let response: SwarmCodes.SwarmlingResponse = SwarmCodes.C_MOVE;
        if (this.AssignedCreep.pos.isEqualTo(this.TargetPos)) {
            response = SwarmCodes.E_ACTION_UNNECESSARY;
        }

        return response;
    }
    ValidateAction(): SwarmCodes.SwarmlingResponse {
        if (this.AssignedCreep.pos.isEqualTo(this.TargetPos)) {
            return SwarmCodes.E_ACTION_UNNECESSARY;
        }
        return SwarmCodes.C_NONE;
    }
}