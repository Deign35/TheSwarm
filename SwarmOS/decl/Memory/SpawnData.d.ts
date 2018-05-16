
/** SpawnData */
declare interface SpawnRegistry_Memory extends MemBase {
    [id: string]: SpawnRequest
}
declare interface CreepRegistry_Memory extends MemBase {
    [id: string]: CreepContext
}
declare interface CreepContext extends MemBase {
    o?: PID;        // (o)wner process

    n: CreepID;     // (n)ame
    b: CT_ALL;      // (b)ody definition
    l: number;      // body (l)evel
}

declare interface SpawnRequest extends MemBase {
    con: CreepContext;  // Context
    id: SpawnRequestID; // requestID
    loc: RoomID;        // Where the spawn request originates
    pid: PID;           // RequestorPID
    pri: Priority;      // How much of a priority is this spawn??
    sta: SpawnState;    // Current Spawn state

    dm?: any;           // Default memory
    max?: number;       // Max spawning distance allowed for this spawn.
    spawner?: StructureID; // ID of the spawner that this creep is being spawned at.
}
