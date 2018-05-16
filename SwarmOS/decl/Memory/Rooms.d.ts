
/** Room Memory */
declare interface RoomProcess_Memory extends MemBase {
    roomName: string;
    creeps: RoomProcess_CreepMemory
}

declare interface RoomProcess_CreepMemory extends MemBase {
    bui: PID[]; // Builders
    ref?: PID[]; // Refillers
    harv?: PID[]; // Harvesters
    upg?: PID[]; // Upgraders

    misc?: PID[]; // Misc
}

declare interface BasicOwnedRoom_Memory extends RoomProcess_Memory {
    sources: SDictionary<PID | undefined>;
}

declare interface RoomProcess_CreepAssignment {
    pid?: PID,
    CT: CT_ALL,
    lvl: number
}
declare interface SimpleOwnedRoom_Memory extends RoomProcess_Memory {
    creepAssignments: { [id: string]: RoomProcess_CreepAssignment[] };
    sourcePIDs: SDictionary<PID | undefined>;
}