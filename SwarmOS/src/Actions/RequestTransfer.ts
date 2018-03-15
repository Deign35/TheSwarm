import { ActionWithTarget } from "Actions/ActionBase";

declare type RequestTargetType = Creep;
export class RequestTransferAction extends ActionWithTarget<RequestTargetType> {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return RequestTransferAction.SimultaneousActionValue; }
    protected ActionImplemented(): SwarmlingResponse {
        let result = this.Target.transfer(this.AssignedCreep, RESOURCE_ENERGY);
        let actionResponse: SwarmlingResponse = C_NONE;
        switch (result) {
            case (OK): actionResponse = C_NONE; break;
            case (ERR_NOT_OWNER): throw 'Not the owner of this object.';
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = C_NONE; break;
            //case(ERR_INVALID_TARGET): Target is not a valid attackable object.
            //case (ERR_NOT_IN_RANGE): actionResponse = C_MOVE; break;
            //case(ERR_NO_BODYPART): No attack body parts on this creep.
            // This means that the body part I was expecting to have is gone!!!
            default: console.log('FAILED ACTION[RequestTransferAction] -- ' + result);
        }

        return actionResponse;
    }
    ValidateAction(): SwarmlingResponse {
        if (!this.Target.pos.isNearTo(this.AssignedCreep)) {
            return C_MOVE;
        }
        if (this.Target.carry[RESOURCE_ENERGY] > 0) {
            return C_NONE;
        }

        return E_REQUIRES_ENERGY;
    }
}