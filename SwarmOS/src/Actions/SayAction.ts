import { ActionBase } from "./ActionBase";
import * as SwarmCodes from "Consts/SwarmCodes"

export class SayAction extends ActionBase {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return SayAction.SimultaneousActionValue; }
    constructor(creep: Creep, public SayString: string) {
        super(creep);
    }
    protected ActionImplemented(): SwarmCodes.SwarmlingResponse {
        this.AssignedCreep.say(this.SayString);
        return SwarmCodes.C_NONE;
    }
    protected GetMovePosition(): RoomPosition {
        throw new Error("Method not implemented.");
    }
    ValidateAction(): SwarmCodes.SwarmlingResponse {
        return SwarmCodes.C_NONE;
    }
}