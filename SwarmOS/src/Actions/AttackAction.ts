import { ActionWithTarget } from "Actions/ActionBase";
import * as SwarmCodes from "Consts/SwarmCodes"

declare type AttackTargetType = Creep | Structure;
export class AttackAction extends ActionWithTarget<AttackTargetType> {
    static SimultaneousActionValue = 2;
    protected get BlockValue() { return AttackAction.SimultaneousActionValue; }
    protected ActionImplemented(): SwarmCodes.SwarmlingResponse {
        let result = this.AssignedCreep.attack(this.Target);
        let actionResponse: SwarmCodes.SwarmlingResponse = SwarmCodes.C_NONE;
        switch (result) {
            //case(OK): actionResponse = SwarmEnums.CRT_None; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            //case(ERR_INVALID_TARGET): Target is not a valid attackable object.
            case (ERR_NOT_IN_RANGE): actionResponse = SwarmCodes.C_MOVE; break;
            //case(ERR_NO_BODYPART): No attack body parts on this creep.
            // This means that the body part I was expecting to have is gone!!!
            default: console.log('FAILED ACTION[AttackAction] -- ' + result);
        }

        return actionResponse;
    }
    ValidateAction(): SwarmCodes.SwarmlingResponse { return SwarmCodes.C_NONE; }
}