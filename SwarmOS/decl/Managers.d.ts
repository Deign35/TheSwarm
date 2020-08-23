
/** SpawnManager */
declare type SpawnManager_Memory = MemBase & {
    [id in SpawnID]: SpawnRequest
}
declare interface SpawnContext extends MemBase {
    creep_name: CreepID; // (n)ame
    creep_type: CT_ALL;  // (c)reep type
    level: number;  // (l)evel
    owner_pid: PID;     // creep parent (p)id
}
declare interface SpawnRequest extends MemBase {
    spawnContext: SpawnContext;  // Context
    spawnOrigin: RoomID;         // Where the spawn request originates
    spawnPriority: Priority;     // How much of a priority is this spawn??
    spawnState: SpawnState;      // Current Spawn state

    defaultMemory?: CreepMemory; // Default memory
    spawner?: StructureID;       // ID of the spawner that this creep is being spawned at.
}
