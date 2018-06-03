/** CreepActions */

declare interface HarvestJob_Memory extends MemBase {
    a?: PID;        // (a)ctivity
    t: ObjectID;    // (t)arget
    i?: ObjectID;   // (i)n link
    c?: ObjectID;   // (c)ontainer
    h?: CreepID;    // (h)arvester
    r: RoomID;      // (r)oom
}
declare interface BootstrapRefiller_Memory extends MemBase {
    creeps: {
        h1: {           // (h)arvester 1
            a?: PID;    // (a)ctivity
            c?: CreepID;// (c)reep
        },
        h2: {           // (h)arvester 2
            a?: PID;    // (a)ctivity
            c?: CreepID;// (c)reep
        }
        r: {            // (r)efiller
            a?: PID;    // (a)ctivity
            c?: CreepID;// (c)reep
        }
    }

    rID: RoomID;    // (r)oom (ID)
    s: ObjectID;    // (s)ource ID
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

declare interface Bootstrap_Memory extends MemBase {
    rID: RoomID;
    refiller?: PID;
    containers: ObjectID[];

    creeps: {
        [id in CreepID]: {
            a?: PID;        // (a)ctivity
            t: ObjectID;    // (t)arget
        }
    }
    harvesters: {
        [id in CreepID]: {
            a?: PID;
            t: ObjectID;    // (t)arget
        }
    }
}