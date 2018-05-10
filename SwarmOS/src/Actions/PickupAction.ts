import { ActionWithTarget } from "Actions/ActionBase";

declare type PickupTargetType = Resource;
export class PickupAction extends ActionWithTarget<PickupTargetType> {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return PickupAction.SimultaneousActionValue; }
    protected ActionImplemented(): SwarmlingResponse {
        let result = this.AssignedCreep.pickup(this.Target);
        let actionResponse: SwarmlingResponse = SR_NONE;
        switch (result) {
            case (OK): actionResponse = SR_NONE; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            //case(ERR_INVALID_TARGET): Target is not a valid constructionsite.
            case (ERR_FULL): actionResponse = SR_ACTION_UNNECESSARY; break;
            case (ERR_NOT_IN_RANGE): actionResponse = SR_MOVE; break;
            default: console.log('FAILED ACTION[PickupAction] -- ' + result);
        }

        return actionResponse;
    }
    ValidateAction(): SwarmlingResponse {
        if (_.sum(this.AssignedCreep.carry) == this.AssignedCreep.carryCapacity) {
            return SR_ACTION_UNNECESSARY;
        }
        return SR_NONE;
    }
}