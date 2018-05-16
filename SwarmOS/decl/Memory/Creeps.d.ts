
/** Creep extension Memory */
declare interface CreepMemory extends MemBase {
    [id: string]: CreepProcess_Memory
}

declare interface CreepProcess_Memory extends MemBase {
    SR?: SpawnRequestID;// Spawn request ID
    SB: CT_ALL;      // (b)ody definition
    SL: number;      // body (l)evel

    tar?: ObjectID;     // The current target
    home: RoomID;       // Room from where this creep was spawned
    loc: RoomID;        // Room location of where this creep is doing its shtuff
    get: boolean;       // Getting energy
    en: boolean;        // Enabled
}
declare interface SpawnRefiller_Memory extends CreepProcess_Memory {
}
declare interface Harvester_Memory extends CreepProcess_Memory {
    tar: string;
    linkID?: string;
    containerID?: string;
    constructionSite?: string;
}
declare interface Upgrader_Memory extends CreepProcess_Memory {
    isReserving?: boolean;
    isClaiming?: boolean;
}
declare interface Builder_memory extends CreepProcess_Memory {

}



/** CreepGroups */
declare interface CreepGroup_Memory extends MemBase {
    enabled: boolean; // (en)abled
    assignments: SDictionary<CreepGroup_CreepRef>;
    homeRoom: RoomID;
    targetRoom: RoomID;
}

declare interface CreepGroup_CreepRef extends MemBase {
    pid?: PID;      // The pid associated with this role
    SR: SpawnRequestID; // ID corresponding to the spawn request
    CT: CT_ALL;     // (C)reep (T)ype
    lvl: number;    // role level
}