declare interface SpawnActivity_Memory extends MemBase {
    sID: string;
}
declare interface RoomActivity_Memory extends MemBase {
    rID: RoomID;
    sID: string;
    energyTargets: {
        [id: string]: boolean;
    };
    hb?: boolean;
}
declare interface CreepActivity_Memory extends SingleCreepActivity_Memory {
    c: CreepID;     //Creep
}

declare interface RepetitiveCreepActivity_Memory extends MemBase {
    a: SingleCreepActivity_Memory[];    // (a)ctions
    c: CreepID;
    p?: PID;
}

declare interface SingleCreepActivity_Memory extends MemBase {
    at: ActionType;
    a?: number;     // (a)mount for resource transfers
    n?: number;     // (n)umber of times to run this action
    e?: ScreepsReturnCode[];    // (e)xempted failures
    m?: string;     // (m)essage to write to a say or signcontroller
    p?: { x?: number, y?: number, roomName: string };  // (p)osition to move to
    r?: ResourceConstant // (r)esource type to withdraw or transfer
    t?: ObjectID;   // (t)arget
}