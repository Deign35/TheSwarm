import { ActionBase } from "./ActionBase";

export class SayAction extends ActionBase {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return SayAction.SimultaneousActionValue; }
    constructor(creep: Creep, public SayString: string) {
        super(creep);
    }
    protected ActionImplemented(): SwarmlingResponse {
        this.AssignedCreep.say(this.SayString);
        return SR_NONE;
    }
    protected GetMovePosition(): RoomPosition {
        return this.AssignedCreep.pos;
    }
    ValidateAction(): SwarmlingResponse {
        return SR_NONE;
    }
}