import { ActionWithPosition } from "Actions/ActionBase";
import * as SwarmCodes from "Consts/SwarmCodes";

export class DropAction extends ActionWithPosition {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return DropAction.SimultaneousActionValue; }
    constructor(creep: Creep, targetPos: RoomPosition, protected ResourceType: ResourceConstant = RESOURCE_ENERGY, protected Amount: number = 0) {
        super(creep, targetPos);
        if (Amount == 0) {
            Amount = creep.carry[ResourceType] || 0;
        }
    }
    protected get EnergyBlockValue() { return 6; }
    protected ActionImplemented(): SwarmCodes.SwarmlingResponse {
        if (!this.AssignedCreep.pos.isEqualTo(this.TargetPos)) {
            //We're here!
            return SwarmCodes.C_MOVE;
        }
        let result = this.AssignedCreep.drop(this.ResourceType, this.Amount);
        let actionResponse: SwarmCodes.SwarmlingResponse = SwarmCodes.C_NONE;
        switch (result) {
            case (OK): actionResponse = SwarmCodes.C_NONE; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmCodes.C_NONE; break;
            default: console.log('FAILED ACTION[AttackAction] -- ' + result);
        }

        return actionResponse;
    }
    ValidateAction(): SwarmCodes.SwarmlingResponse {
        // Sum!
        if (this.AssignedCreep.carry[this.ResourceType as string] < this.Amount) {
            return SwarmCodes.E_REQUIRES_ENERGY;
        }
        return SwarmCodes.C_NONE;
    }
}