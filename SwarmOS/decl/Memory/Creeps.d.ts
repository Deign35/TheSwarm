
/** Creep extension Memory */
declare type CreepMemory = MemBase & {
    [id: string]: CreepProcess_Memory
}

declare interface CreepProcess_Memory extends MemBase {
    SR?: SpawnRequestID;// Spawn request ID 
    CR?: CreepID;       // Creep name

    tar?: ObjectID;     // The current target
    home: RoomID;       // Room from where this creep was spawned
    loc: RoomID;        // Room location of where this creep is doing its shtuff
    get: boolean;       // Getting energy
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
declare interface Builder_Memory extends CreepProcess_Memory {

}

/** CreepGroups */
declare interface CreepGroup_Memory extends ChildThread_Memory {
    enabled: boolean; // (en)abled
    assignments: IDictionary<CreepID, CreepGroup_Assignment>;
    homeRoom: RoomID;
    targetRoom: RoomID;
    CT: CT_ALL;
    lvl: number;
    numReq: number;
    pri: Priority
}

declare interface CreepGroup_Assignment extends MemBase {
    pid?: PID;          // ID corresponding to the assigned PID
    SR: SpawnRequestID; // ID corresponding to the spawn request
    CT: CT_ALL;         // (C)reep (T)ype
    lvl: number;        // role level
}

declare interface HarvesterGroup_Memory extends CreepGroup_Memory {
    sIDs: ObjectID[]; // Sources
}
declare interface HarvesterGroup_Assignment extends CreepGroup_Assignment {
    sID: ObjectID       // Source id for harvesting
}