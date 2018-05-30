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