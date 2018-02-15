import { ActionWithTarget } from "Actions/ActionBase";
import * as SwarmCodes from "Consts/SwarmCodes";
import * as _ from "lodash";

declare type PickupTargetType = Resource;
export class PickupAction extends ActionWithTarget<PickupTargetType> {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return PickupAction.SimultaneousActionValue; }
    protected ActionImplemented(): SwarmCodes.SwarmlingResponse {
        let result = this.AssignedCreep.pickup(this.Target);
        let actionResponse: SwarmCodes.SwarmlingResponse = SwarmCodes.C_NONE;
        switch (result) {
            case (OK): actionResponse = SwarmCodes.C_NONE; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            //case(ERR_INVALID_TARGET): Target is not a valid constructionsite.
            case (ERR_FULL): actionResponse = SwarmCodes.E_ACTION_UNNECESSARY; break;
            case (ERR_NOT_IN_RANGE): actionResponse = SwarmCodes.C_MOVE; break;
            default: console.log('FAILED ACTION[AttackAction] -- ' + result);
        }

        return actionResponse;
    }
    ValidateAction(): SwarmCodes.SwarmlingResponse {
        if (_.sum(this.AssignedCreep.carry) == this.AssignedCreep.carryCapacity) {
            return SwarmCodes.E_ACTION_UNNECESSARY;
        }
        return SwarmCodes.C_NONE;
    }
}