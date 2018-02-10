import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";

export abstract class ActionBase {
    constructor(public AssignedCreep: Creep) { }
    Run(autoMove: boolean = false): SwarmEnums.CommandResponseType {
        let jobResult = this.ActionImplemented();

        if(autoMove && jobResult == SwarmEnums.CRT_Move) {
            this.Move(this.GetMovePosition());
        }

        return jobResult;
    }
    Move(pos: RoomPosition): SwarmEnums.CommandResponseType {
        let jobResult = this.AssignedCreep.moveTo(pos);
        return SwarmEnums.CRT_None;
    }

    protected abstract ActionImplemented(): SwarmEnums.CommandResponseType;
    protected abstract GetMovePosition(): RoomPosition;
    abstract ValidateAction(): SwarmEnums.CommandResponseType;
}
export abstract class ActionWithPosition extends ActionBase {
    constructor(creep: Creep, protected TargetPos: RoomPosition) {
        super(creep);
    }
    GetMovePosition() {
        return this.TargetPos;
    }
}
export abstract class ActionWithTarget<T extends RoomObject> extends ActionBase {
    constructor(creep: Creep, protected Target: T) {
        super(creep);
    }
    GetMovePosition() {
        return this.Target.pos;
    }
}

export function ActionGenerator() {

}