/** Room Memory */

declare interface BasicRoom_Memory extends MemBase {
    homeRoom: RoomID;
    targetRoom: RoomID;
}

declare interface Tower_Memory extends MemBase {
    rID: RoomID;
}

declare interface RoomProvider_Memory extends MemBase {
    rID: RoomID;
    home: RoomID;
}

declare interface RoomStateActivity_Memory extends MemBase {
    lu: number;     // (l)ast (u)pdated
    nb?: boolean;   // (n)eeds re(b)oot
    hr: RoomID;     // (h)ome (r)oom
    rID: RoomID;    // (t)arget (r)oom
    // (TODO): Change hb to nb all over.
}

declare interface RoomStateHarvest_Memory extends RoomStateActivity_Memory {
    harvesters: {
        [id: string]: {
            sup?: ObjectID;  //support structure
            pid?: PID;
        }
    }
}

declare interface RoomStateMisc_Memory extends RoomStateActivity_Memory {
    lr: number;     // (l)ast (r)esources
}

declare interface RoomStateWorkTarget_Memory extends RoomStateActivity_Memory {
    needsRepair: ObjectID[];
    cSites: ObjectID[];
}