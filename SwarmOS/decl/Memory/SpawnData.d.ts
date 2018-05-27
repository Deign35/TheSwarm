
/** SpawnData */
declare type SpawnRegistry_Memory = MemBase & {
    [id in SpawnID]: SpawnRequest
}
declare interface CreepRegistry_Memory extends MemBase {
    registeredCreeps: { [id in CreepID]: CreepContext };
}
declare interface CreepContext extends MemBase {
    o?: PID;        // (o)wner process

    n: CreepID;     // (n)ame
    ct: CT_ALL;     // (b)ody definition
    l: number;      // body (l)evel
}

declare interface SpawnRequest extends MemBase {
    con: CreepContext;  // Context
    id: SpawnRequestID; // requestID
    loc: RoomID;        // Where the spawn request originates
    pri: Priority;      // How much of a priority is this spawn??
    spSta: SpawnState;    // Current Spawn state

    dm?: ScreepsObject_CreepMemory;           // Default memory
    max?: number;       // Max spawning distance allowed for this spawn.
    spawner?: StructureID; // ID of the spawner that this creep is being spawned at.
}
