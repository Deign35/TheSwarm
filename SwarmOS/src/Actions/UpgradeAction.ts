import * as SwarmCodes from "Consts/SwarmCodes";
import * as _ from "lodash";
import { ActionWithTarget } from "Actions/ActionBase";

declare type UpgradeTargetType = StructureController;
export class UpgradeAction extends ActionWithTarget<UpgradeTargetType> {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return UpgradeAction.SimultaneousActionValue; }
    protected get EnergyBlockValue() { return 1; }
    ActionImplemented() {
        let result = this.AssignedCreep.upgradeController(this.Target);
        let actionResponse: SwarmCodes.SwarmlingResponse = SwarmCodes.C_NONE;
        switch (result) {
            case (OK): actionResponse = SwarmCodes.C_NONE; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmCodes.E_REQUIRES_ENERGY; break;
            //case(ERR_INVALID_TARGET): Target is not a valid transfer object.
            case (ERR_NOT_IN_RANGE): actionResponse = SwarmCodes.C_MOVE; break;
            //case(ERR_NO_BODYPART): No work body parts on this creep.
            default: console.log('FAILED ACTION[UpgradeAction] -- ' + result);
        }

        return actionResponse;
    }

    ValidateAction() {
        let result = SwarmCodes.C_NONE;
        if (this.AssignedCreep.carry.energy == 0) {
            result = SwarmCodes.E_REQUIRES_ENERGY;
        }
        return result as SwarmCodes.SwarmlingResponse;
    }
}