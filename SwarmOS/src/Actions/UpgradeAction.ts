import { ActionWithTarget } from "Actions/ActionBase";

declare type UpgradeTargetType = StructureController;
export class UpgradeAction extends ActionWithTarget<UpgradeTargetType> {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return UpgradeAction.SimultaneousActionValue; }
    protected get EnergyBlockValue() { return 1; }
    ActionImplemented() {
        let result = this.AssignedCreep.upgradeController(this.Target);
        let actionResponse: SwarmlingResponse = SR_NONE;
        switch (result) {
            case (OK): actionResponse = SR_NONE; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SR_REQUIRES_ENERGY; break;
            //case(ERR_INVALID_TARGET): Target is not a valid transfer object.
            case (ERR_NOT_IN_RANGE): actionResponse = SR_MOVE; break;
            //case(ERR_NO_BODYPART): No work body parts on this creep.
            default: console.log('FAILED ACTION[UpgradeAction] -- ' + result);
        }

        return actionResponse;
    }

    ValidateAction() {
        let result = SR_NONE;
        if (this.AssignedCreep.carry.energy == 0) {
            result = SR_REQUIRES_ENERGY;
        }
        if (!this.AssignedCreep.pos.inRangeTo(this.Target, 3)) {
            result = SR_MOVE;
        }
        if (!this.Target.sign || this.Target.sign.text != MY_SIGNATURE) {
            if (!this.AssignedCreep.pos.isNearTo(this.Target)) {
                result = SR_MOVE;
            }
            else {
                this.AssignedCreep.signController(this.Target, MY_SIGNATURE);
            }
        }
        return result as SwarmlingResponse;
    }
}