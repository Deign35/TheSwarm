declare interface ActionMemory extends MemBase {
    c: CreepID;     //Creep
    at: ActionType; //ActionType
    t?: ObjectID;   //Target
    tp?: { x?: number, y?: number, roomName: string }; //TargetPosition
    a?: number;     //Amount
    m?: string;     //Message
    rt?: ResourceConstant; //ResourceType
    p?: PathStep[]; //Path
}

declare interface SpawnActivity_Memory extends MemBase {
    sID: string;
}
declare interface RoomActivity_Memory extends MemBase {
    rID: RoomID;
}

declare interface RoomGroup_Memory extends MemBase {
    rID: RoomID;
    creeps: {
        [id in CreepID]: {
            act: PID
        }
    }
    workTasks: {
        tar: string,
        act: ActionType
    }[];
    transferTasks: {
        tar: string
    }[];
    pendingTasks: {
        tar: string,
        act: ActionType
    }[];
}
declare interface HarvestJob_Memory extends MemBase {
    a?: PID;        // (a)ctivity
    t: ObjectID;    // (t)arget
    i?: ObjectID;    // (i)n link
    o?: ObjectID;    // (o)ut link
    c?: ObjectID;    // (c)ontainer
    h?: CreepID;    // (h)arvester
    r: RoomID;      // (r)oom
}
declare interface WorkerJob_Memory extends MemBase {
    a?: PID;        // (a)ctivity
    c: CreepID;     // (c)reep
    r: RoomID;      // (r)oom
}

declare interface WorkerGroup_Memory extends MemBase {
    creeps: {
        [id in CreepID]: {
            a?: PID;        // (a)ctivity
        }
    }

    targets: {
        [id: string]: {
            a: ActionType;  // (a)ctionType
            p: Priority;    // (p)riority
        }
    }

    energy: ObjectID[];     // energy withdrawal targets
    allocatedEnergy: number;// energy allowed to be used by this group.
}





declare interface TaskRegistry_Memory extends MemBase {
    tasks: { [id: string]: TaskAssignment_Memory }
}

declare interface TaskAssignment_Memory extends MemBase {
    at: ActionType;
    loc: RoomID;
    pri: Priority;
    tar: ObjectID;

    a?: number;     //Amount
    rt?: ResourceConstant; //ResourceType
}