import { ActionWithPosition } from "Actions/ActionBase";

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
    protected ActionImplemented(): SwarmlingResponse {
        if (!this.AssignedCreep.pos.isEqualTo(this.TargetPos)) {
            //We're here!
            return C_MOVE;
        }
        let result = this.AssignedCreep.drop(this.ResourceType, this.Amount);
        let actionResponse: SwarmlingResponse = C_NONE;
        switch (result) {
            case (OK): actionResponse = C_NONE; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = E_ACTION_UNNECESSARY; break;
            default: console.log('FAILED ACTION[DropAction] -- ' + result);
        }

        return actionResponse;
    }
    ValidateAction(): SwarmlingResponse {
        // Sum!
        if (this.AssignedCreep.carry[this.ResourceType as string] < this.Amount) {
            return E_ACTION_UNNECESSARY;
        }
        return C_NONE;
    }
}