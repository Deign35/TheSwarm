/** Room Memory */
declare interface RoomProvider_Memory extends MemBase {
    rID: RoomID;
    home: RoomID;
}
declare interface RoomMonitor_Memory extends MemBase {
    lu: number;
    nb?: boolean;   // (n)eeds re(b)oot
    hr: RoomID;     // (h)ome (r)oom
    rID: RoomID;    // (t)arget (r)oom
    fr?: number;     // (fr)equency
}
declare interface RoomStateHarvest_Memory extends RoomMonitor_Memory {
    harvesters: {
        [id: string]: {
            sup?: ObjectID;  //support structure
            pid?: PID;
        }
    }
}

declare interface RoomStateWorkTarget_Memory extends RoomMonitor_Memory {
    luRE: number;
    needsRepair: ObjectID[];
    luCS: number;
    cSites: ObjectID[];
}
declare interface RoomMonitorWorkCapacity_Memory extends RoomMonitor_Memory {
    lr: number;     // (l)ast (r)esources
    tA: number;     // (t)rigger on (A)dditional resources
    tT: number;     // (t)rigger on (T)otal resources
}

declare interface RoomMapMonitor_Memory extends RoomMonitor_Memory {
    luEN: number;   // Last updated Spawn Energy
    luRE: number;   // Last updated Refill
    luRO: number;   // Last updated Roads
    luIM: number;   // Last updated Impassable layer
}