/** CreepActions */

declare interface HarvestJob_Memory extends MemBase {
    a?: PID;        // (a)ctivity
    t: ObjectID;    // (t)arget
    i?: ObjectID;   // (i)n link
    c?: ObjectID;   // (c)ontainer
    h?: CreepID;    // (h)arvester
    r: RoomID;      // (r)oom
}
declare interface WorkerJob_Memory extends MemBase {
    a?: PID;        // (a)ctivity
    c: CreepID;     // (c)reep
    r: RoomID;      // (r)oom
}

declare interface WorkerGroup_Memory extends MemBase {
    rID: RoomID;
    creeps: {
        [id in CreepID]: {
            a?: PID;        // (a)ctivity
        }
    }

    targets: IDictionary<ObjectID, WorkerTarget_Memory>;
    energy: IDictionary<ObjectID, WorkerTarget_Memory>;     // energy withdrawal targets
}

declare interface WorkerTarget_Memory extends MemBase {
    a: ActionType;  // (a)ctionType
    t: TargetType;  // (o)bject type
    p: Priority;    // (p)riority
}