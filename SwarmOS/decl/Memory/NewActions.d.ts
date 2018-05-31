declare interface ActionMemory extends MemBase {
    c: CreepID;     //Creep
    at: ActionType; //ActionType
    p: PathStep[]; //Path
    t?: ObjectID;   //Target
    tp?: { x?: number, y?: number, roomName: string }; //TargetPosition
    a?: number;     //Amount
    m?: string;     //Message
    rt?: ResourceConstant; //ResourceType
}

declare interface SpawnActivity_Memory extends MemBase {
    sID: string;
}
declare interface RoomActivity_Memory extends MemBase {
    rID: RoomID;
}

declare interface RoomGroup_Memory extends MemBase {
    rID: RoomID;
    creeps: CreepID[];
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