/** CreepActions */
declare interface HarvestJob_Memory extends MemBase {
    a?: PID;        // (a)ctivity
    t: ObjectID;    // (t)arget
    l?: ObjectID;   // (l)ink
    c?: ObjectID;   // (c)ontainer
    h?: CreepID;    // (h)arvester
    rID: RoomID;    // (r)oom
    SUPPORT?: boolean;
}

declare interface ScoutJob_Memory extends MemBase {
    a?: PID;        // (a)ctivity
    c?: CreepID;    // (c)reep
    rID: RoomID;    // (r)oom
    n: RoomID[];    // (n)earby Rooms to scout
}
declare interface SoloJob_Memory extends MemBase {
    a?: PID;        // (a)ctivity
    c?: CreepID;    // (c)reep
    exp?: boolean;  // (exp)pires -- Kill the process when the creep dies
    rID: RoomID;    // (h)ome room
    tr: RoomID;     // (t)arget (r)oom
}
declare interface ControlledRoomRefiller_Memory extends SoloJob_Memory {

}

declare interface WorkerGroup_Memory extends MemBase {
    rID: RoomID;
    creeps: {
        [id in CreepID]: {
            a?: PID;        // (a)ctivity
        }
    }
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

declare interface Bootstrap_Memory extends MemBase {
    rID: RoomID;
    containers: ObjectID[];
}