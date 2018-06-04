/** CreepActions */

declare interface HarvestJob_Memory extends MemBase {
    a?: PID;        // (a)ctivity
    t: ObjectID;    // (t)arget
    i?: ObjectID;   // (i)n link
    c?: ObjectID;   // (c)ontainer
    h?: CreepID;    // (h)arvester
    r: RoomID;      // (r)oom
    SUPPORT?: boolean;
}

declare interface WorkerGroup_Memory extends MemBase {
    rID: RoomID;
    creeps: {
        [id in CreepID]: {
            a?: PID;        // (a)ctivity
        }
    }
}
declare interface GenericWorkerGroup_Memory<TarType extends WorkerTarget_Memory, EnType extends WorkerTarget_Memory> extends WorkerGroup_Memory {
    targets: IDictionary<ObjectID, TarType>;
    energy: IDictionary<ObjectID, EnType>;     // energy withdrawal targets
}

declare interface BootstrapRefiller_Memory extends MemBase {
    ref: {              // (ref)iller
        a?: PID;        // (a)ctivity
        c?: CreepID;    // (creep)
    }
    rID: RoomID;            // (r)oom(ID)
    s: ObjectID;            // (s)ource ID
    hb: boolean;            // (h)as (b)oot
}
declare interface BootstrapBuilder_Memory extends MemBase {
    bui: {              // (bui)lder
        a?: PID;        // (a)ctivity
        c?: CreepID;    // (creep)
    }
    rID: RoomID;            // (r)oom(ID)
    s?: ObjectID;            // (s)ource ID
    sites: ObjectID[];
}

declare interface WorkerTarget_Memory extends MemBase {
    a: ActionType;  // (a)ctionType
    t: TargetType;  // (o)bject type
}

declare interface WorkerTarget_PriorityMemory extends WorkerTarget_Memory {
    p: Priority;    // (p)riority
}

declare interface Bootstrap_Memory extends MemBase {
    rID: RoomID;
    containers: ObjectID[];
}