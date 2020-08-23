
/** SpawnData */
declare type SpawnRegistry_Memory = MemBase & {
    [id in SpawnID]: SpawnRequest
}
declare interface CreepRegistry_Memory extends MemBase {
    registeredCreeps: { [id in CreepID]: CreepContext };
}
declare interface CreepContext extends MemBase {
    o?: PID;        // (o)wner process
    c: CreepID;     // (n)ame
    rID: RoomID;    // spawn room
}

declare interface SpawnContext extends MemBase {
    n: CreepID; // (n)ame
    c: CT_ALL;  // (c)reep type
    l: number;  // (l)evel
    p: PID;     // creep parent (p)id
}
declare interface SpawnRequest extends MemBase {
    con: SpawnContext;  // Context
    id: SpawnRequestID; // requestID
    loc: RoomID;        // Where the spawn request originates
    pri: Priority;      // How much of a priority is this spawn??
    spSta: SpawnState;    // Current Spawn state

    dm?: CreepMemory;           // Default memory
    max?: number;       // Max spawning distance allowed for this spawn.
    spawner?: StructureID; // ID of the spawner that this creep is being spawned at.
}
