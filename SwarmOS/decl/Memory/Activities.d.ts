declare interface SpawnActivity_Memory extends MemBase {
    sID: string;
}
declare interface RoomActivity_Memory extends MemBase {
    rID: RoomID;
}
declare interface CreepActivity_Memory extends MemBase {
    c: CreepID;     //Creep
    at: ActionType; //ActionType
    t?: ObjectID;   //Target
    tp?: { x?: number, y?: number, roomName: string }; //TargetPosition
    a?: number;     //Amount
    m?: string;     //Message
    rt?: ResourceConstant; //ResourceType
    p?: PathStep[]; //Path
    f: ScreepsReturnCode[]; // Failure codes that should be ignored
}