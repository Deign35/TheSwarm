import { ActionWithTarget } from "Actions/ActionBase";

declare type BuildTargetType = ConstructionSite;
export class BuildAction extends ActionWithTarget<BuildTargetType> {
    static SimultaneousActionValue = 3;
    protected get BlockValue() { return BuildAction.SimultaneousActionValue; }
    protected get EnergyBlockValue() { return 2; }
    protected ActionImplemented(): SwarmlingResponse {
        let result = this.AssignedCreep.build(this.Target);
        let actionResponse: SwarmlingResponse = SR_NONE;
        switch (result) {
            case (OK): actionResponse = SR_NONE; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SR_REQUIRES_ENERGY; break;
            //case(ERR_INVALID_TARGET): Target is not a valid constructionsite.
            case (ERR_NOT_IN_RANGE): actionResponse = SR_MOVE; break;
            //case(ERR_NO_BODYPART): No work body parts on this creep.
            //case(ERR_RCL_NOT_ENOUGH): Need higher room control
            default: console.log('FAILED ACTION[BuildAction] -- ' + result);
        }

        return actionResponse;
    }
    ValidateAction(): SwarmlingResponse {
        if (!this.AssignedCreep.pos.inRangeTo(this.Target, 3)) {
            return SR_MOVE;
        }
        // Sum!
        if (this.AssignedCreep.carry.energy == 0) {
            return SR_REQUIRES_ENERGY;
        }
        return SR_NONE;
    }
}