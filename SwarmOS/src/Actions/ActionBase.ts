import * as SwarmEnums from "SwarmEnums";
import * as _ from "lodash";

export abstract class ActionBase {
    constructor(public AssignedCreep: Creep) { }
    Run(): SwarmEnums.CommandResponseType {
        let jobResult = this.ActionImplemented();

        switch(jobResult) {
            case(SwarmEnums.CRT_Condition_Full): jobResult = (_.sum(this.AssignedCreep.carry) == this.AssignedCreep.carryCapacity) ? SwarmEnums.CRT_Next : SwarmEnums.CRT_None;
            case(SwarmEnums.CRT_Move): jobResult = this.Move(this.GetMovePosition()); break;
            case(SwarmEnums.CRT_NewTarget): break;
        }
        return jobResult;
    }
    Move(pos: RoomPosition): SwarmEnums.CommandResponseType {
        let jobResult = this.AssignedCreep.moveTo(pos);
        return SwarmEnums.CRT_None;
    }

    protected abstract ActionImplemented(): SwarmEnums.CommandResponseType;
    protected abstract GetMovePosition(): RoomPosition;
    protected abstract ValidateAction(): SwarmEnums.CommandResponseType;
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