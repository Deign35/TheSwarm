export abstract class ActionBase {
    constructor(public AssignedCreep: Creep) { }

    protected get EnergyBlockValue() { return 0; }
    Run(autoMove: boolean = true): SwarmlingResponse {
        let jobResult = this.ActionImplemented();

        if (autoMove && jobResult == SR_MOVE) {
            this.Move(this.GetMovePosition());
        }

        return jobResult;
    }
    Move(pos: RoomPosition) {
        this.AssignedCreep.moveTo(pos);
    }

    // Not set up with a blockValue yet: dismantle:5, attackController:6, rangedHeal: 7, heal: 8
    //                                 : rangedAttack / rangedMassAttack / build / repair / rangedHeal <-- Separate chart for ranged actions (minus upgrade)

    protected abstract get BlockValue(): number;
    protected abstract ActionImplemented(): SwarmlingResponse;
    protected abstract GetMovePosition(): RoomPosition;
    abstract ValidateAction(): SwarmlingResponse;
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

export class NoOpAction extends ActionBase {
    protected BlockValue = 0;
    protected ActionImplemented(): SwarmlingResponse {
        return SR_NONE;
    }
    protected GetMovePosition(): RoomPosition {
        return this.AssignedCreep.pos;
    }
    ValidateAction(): SwarmlingResponse {
        return SR_NONE;
    }
}