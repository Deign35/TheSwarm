import { ActionWithPosition } from "Actions/ActionBase";
import * as SwarmEnums from "SwarmEnums";

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
    protected ActionImplemented(): SwarmEnums.CommandResponseType {
        let result = ERR_NOT_IN_RANGE as SwarmEnums.SwarmReturnCode;
        if (this.AssignedCreep.pos.isEqualTo(this.TargetPos)) {
            //We're here!
            result = this.AssignedCreep.drop(this.ResourceType, this.Amount);
        }
        let actionResponse: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
        switch (result) {
            case (OK): actionResponse = SwarmEnums.CRT_Next; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case (ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmEnums.CRT_Next; break;
            case (ERR_NOT_IN_RANGE): actionResponse = SwarmEnums.CRT_Move; break;
        }

        return actionResponse;
    }
    ValidateAction(): SwarmEnums.CommandResponseType {
        // Sum!
        if (this.AssignedCreep.carry[this.ResourceType] == 0) {
            return SwarmEnums.CRT_Next as SwarmEnums.CommandResponseType;
        }
        return SwarmEnums.CRT_None;
    }
}