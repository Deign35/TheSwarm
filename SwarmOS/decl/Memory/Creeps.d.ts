
/** Creep extension Memory */
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

declare interface ManualCreep_Memory extends MemBase {
    a: ActionType;          // (a)ctionType
    c: CreepID;             // (c)reepName
    t: ObjectID | CreepID;  // (t)arget
    h: RoomID;              // (h)ome
    l: RoomID;              // target (l)ocation
    g: boolean;             // (g)etting resources

    t2?: ObjectID | CreepID; // sub-(t)arget
}

/** CreepGroups */
declare interface CreepGroup_Memory extends MemBase {
    enabled: boolean; // (en)abled
    assignments: IDictionary<GroupID, CreepGroup_Assignment>;
    homeRoom: RoomID;
    targetRoom: RoomID;
}
declare interface ControlGroup_Memory extends CreepGroup_Memory {

}
declare interface InfrastructureGroup_Memory extends CreepGroup_Memory {

}
declare interface TempBranchGroup_Memory extends CreepGroup_Memory {
    unprocessedCreeps: {
        context: CreepContext
        mem: CreepProcess_Memory
    }[];

    jobs: {
        [PKG_CreepBuilder]: GroupID[],
        [PKG_CreepRefiller]: GroupID[],
        [PKG_CreepUpgrader]: GroupID[]
    }
}
declare interface ExtractionGroup_Memory extends CreepGroup_Memory {
}

declare interface CreepGroup_Assignment extends MemBase {
    pid?: PID;          // ID corresponding to the assigned PID
    SR: SpawnRequestID; // ID corresponding to the spawn request
    CT: CT_ALL;         // (C)reep (T)ype
    lvl: number;        // role level
    con: AssignmentContext
}

declare interface AssignmentContext extends MemBase {
    pri: Priority,
    res: boolean        // respawn
}
declare interface AssignmentContext_Harvester extends AssignmentContext {
    tar: ObjectID;
}