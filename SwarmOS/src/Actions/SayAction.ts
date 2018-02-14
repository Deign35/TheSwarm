import { ActionBase } from "./ActionBase";
import * as SwarmEnums from "../SwarmEnums"

export class SayAction extends ActionBase {
    static SimultaneousActionValue = 0;
    protected get BlockValue() { return SayAction.SimultaneousActionValue; }
    constructor(creep: Creep, public SayString: string) {
        super(creep);
    }
    protected ActionImplemented(): SwarmEnums.CommandResponseType {
        this.AssignedCreep.say(this.SayString);
        return SwarmEnums.CRT_Next;
    }
    protected GetMovePosition(): RoomPosition {
        throw new Error("Method not implemented.");
    }
    ValidateAction(): SwarmEnums.CommandResponseType {
        return SwarmEnums.CRT_None;
    }
}