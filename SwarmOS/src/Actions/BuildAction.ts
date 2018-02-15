import { ActionWithTarget } from "Actions/ActionBase";
import * as SwarmEnums from "SwarmEnums";

declare type BuildTargetType = ConstructionSite;
export class BuildAction extends ActionWithTarget<BuildTargetType> {
    static SimultaneousActionValue = 3;
    protected get BlockValue() { return BuildAction.SimultaneousActionValue; }
    protected get EnergyBlockValue() { return 2; }
    protected ActionImplemented(): SwarmEnums.CommandResponseType {
        let result = this.AssignedCreep.build(this.Target);
        let actionResponse: SwarmEnums.CommandResponseType = SwarmEnums.CRT_None;
        switch(result) {
            case(OK): actionResponse = SwarmEnums.CRT_Condition_Empty; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            case(ERR_NOT_ENOUGH_RESOURCES): actionResponse = SwarmEnums.CRT_Next; break;
            //case(ERR_INVALID_TARGET): Target is not a valid constructionsite.
            case(ERR_NOT_IN_RANGE): actionResponse = SwarmEnums.CRT_Move; break;
            //case(ERR_NO_BODYPART): No work body parts on this creep.
            //case(ERR_RCL_NOT_ENOUGH): Need higher room control
        }

        return actionResponse;
    }
    ValidateAction(): SwarmEnums.CommandResponseType {
        // Sum!
        if(this.AssignedCreep.carry.energy == 0) {
            return SwarmEnums.CRT_Next as SwarmEnums.CommandResponseType;
        }
        return SwarmEnums.CRT_None;
    }
}