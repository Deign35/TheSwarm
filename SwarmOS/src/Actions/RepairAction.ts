import { ActionWithTarget } from "Actions/ActionBase";

declare type RepairTargetType = Structure;
export class RepairAction extends ActionWithTarget<RepairTargetType> {
    static SimultaneousActionValue = 4;
    protected get BlockValue() { return RepairAction.SimultaneousActionValue; }
    protected get EnergyBlockValue() { return 3; }
    protected ActionImplemented(): SwarmlingResponse {
        let result = this.AssignedCreep.repair(this.Target);
        let actionResponse: SwarmlingResponse = SR_NONE;
        switch (result) {
            case (OK): actionResponse = SR_NONE; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SR_REQUIRES_ENERGY; break;
            //case(ERR_INVALID_TARGET): Target is not a valid constructionsite.
            case (ERR_NOT_IN_RANGE): actionResponse = SR_MOVE; break;
            //case(ERR_NO_BODYPART): No work body parts on this creep.
            default: console.log('FAILED ACTION[RepairAction] -- ' + result);
        }

        return actionResponse;
    }
    ValidateAction(): SwarmlingResponse {
        if (this.AssignedCreep.carry.energy == 0) {
            return SR_REQUIRES_ENERGY;
        } else if (this.Target.hits == this.Target.hitsMax) {
            return SR_TARGET_INELLIGIBLE;
        }
        return SR_NONE;
    }
}