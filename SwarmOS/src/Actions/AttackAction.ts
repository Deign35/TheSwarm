import { ActionWithTarget } from "Actions/ActionBase";

declare type AttackTargetType = Creep | Structure;
export class AttackAction extends ActionWithTarget<AttackTargetType> {
    static SimultaneousActionValue = 2;
    protected get BlockValue() { return AttackAction.SimultaneousActionValue; }
    protected ActionImplemented(): SwarmlingResponse {
        let result = this.AssignedCreep.attack(this.Target);
        let actionResponse: SwarmlingResponse = SR_NONE;
        switch (result) {
            //case(OK): actionResponse = SwarmEnums.CRT_None; break;
            //case(ERR_NOT_OWNER): Not the owner of this object.
            //case(ERR_BUSY): Creep is still being spawned.
            //case(ERR_INVALID_TARGET): Target is not a valid attackable object.
            case (ERR_NOT_IN_RANGE): actionResponse = SR_MOVE; break;
            //case(ERR_NO_BODYPART): No attack body parts on this creep.
            // This means that the body part I was expecting to have is gone!!!
            default: console.log('FAILED ACTION[AttackAction] -- ' + result);
        }

        return actionResponse;
    }
    ValidateAction(): SwarmlingResponse { return SR_NONE; }
}