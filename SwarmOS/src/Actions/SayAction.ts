import { ActionBase } from "./ActionBase";

export class SayAction extends ActionBase {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return SayAction.SimultaneousActionValue; }
    constructor(creep: Creep, public SayString: string) {
        super(creep);
    }
    protected ActionImplemented(): SwarmlingResponse {
        this.AssignedCreep.say(this.SayString);
        return C_NONE;
    }
    protected GetMovePosition(): RoomPosition {
        throw new Error("Method not implemented.");
    }
    ValidateAction(): SwarmlingResponse {
        return C_NONE;
    }
}