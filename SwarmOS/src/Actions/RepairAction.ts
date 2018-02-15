import { ActionWithTarget } from "Actions/ActionBase";
import * as SwarmCodes from "Consts/SwarmCodes";

declare type RepairTargetType = Structure;
export class RepairAction extends ActionWithTarget<RepairTargetType> {
    static SimultaneousActionValue = 4;
    protected get BlockValue() { return RepairAction.SimultaneousActionValue; }
    protected get EnergyBlockValue() { return 3; }
    protected ActionImplemented(): SwarmCodes.SwarmlingResponse {
        let result = this.AssignedCreep.repair(this.Target);
        let actionResponse: SwarmCodes.SwarmlingResponse = SwarmCodes.C_NONE;
        switch (result) {
            case (OK): actionResponse = SwarmCodes.C_NONE; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmCodes.E_REQUIRES_ENERGY; break;
            //case(ERR_INVALID_TARGET): Target is not a valid constructionsite.
            case (ERR_NOT_IN_RANGE): actionResponse = SwarmCodes.C_MOVE; break;
            //case(ERR_NO_BODYPART): No work body parts on this creep.
            default: console.log('FAILED ACTION[RepairAction] -- ' + result);
        }

        return actionResponse;
    }
    ValidateAction(): SwarmCodes.SwarmlingResponse {
        if (this.AssignedCreep.carry.energy == 0) {
            return SwarmCodes.E_REQUIRES_ENERGY;
        } else if (this.Target.hits == this.Target.hitsMax) {
            return SwarmCodes.E_TARGET_INELLIGIBLE;
        }
        return SwarmCodes.C_NONE;
    }
}