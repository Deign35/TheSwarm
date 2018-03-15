import { ActionWithPosition } from "Actions/ActionBase";

export class MoveToPositionAction extends ActionWithPosition {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return MoveToPositionAction.SimultaneousActionValue; }
    protected ActionImplemented(): SwarmlingResponse {
        let response: SwarmlingResponse = C_MOVE;
        if (this.AssignedCreep.pos.isEqualTo(this.TargetPos)) {
            response = E_ACTION_UNNECESSARY;
        }

        return response;
    }
    ValidateAction(): SwarmlingResponse {
        if (this.AssignedCreep.pos.isEqualTo(this.TargetPos)) {
            return E_ACTION_UNNECESSARY;
        }
        return C_NONE;
    }
}