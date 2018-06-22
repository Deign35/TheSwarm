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

declare interface SoloJob_Memory extends MemBase {
    a?: PID;        // (a)ctivity
    c?: CreepID;    // (c)reep
    exp?: boolean;  // (exp)pires -- Kill the process when the creep dies
    home: RoomID;    // (h)ome room
    rID: RoomID;     // (t)arget (r)oom
}
declare interface ScoutJob_Memory extends SoloJob_Memory {
    n: RoomID[];    // (n)earby Rooms to scout
}
declare interface HarvesterMemory extends SoloJob_Memory {
    src: ObjectID;
    helper: boolean;
    supStr?: ObjectID;
    spLvl: number;
}
declare interface Worker_Memory extends SoloJob_Memory {
    target: {
        t: ObjectID;
        at: ActionType;
        tt: TargetType;
    }
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

declare interface BootstrapRefiller_Memory extends SoloJob_Memory { }
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