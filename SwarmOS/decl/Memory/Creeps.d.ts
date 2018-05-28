/** Jobs */
declare interface CreepJob_Memory extends MemBase {
    cID: CreepID        //creep id
    isSpawning?: boolean
    loc: RoomID;        //location
    home: RoomID;
    obj: ObjectID;      //objective
    pri: Priority;     // spawn (p)riority
    tt: TargetType;
    expires?: boolean;      // expires when the creep dies?

    ct: CT_ALL;
    lvl: number;
    id: string;         // id for parent
}
declare interface BasicJob_Memory extends CreepJob_Memory {
    ac: ActionType;
    ret?: boolean;       // (ret)reiving
    tar: ObjectID;     //  current (tar)get
}

declare interface HarvesterJob_Memory extends BasicJob_Memory {
    cont?: string   //containerID
    fm?: boolean   // finished moving?
}

declare interface CreepGroup_Assignment extends MemBase {
    pid?: PID;
    c?: CreepID;
    ct: CT_ALL;
    lvl: number;
    tt: TargetType; // target type
    tar?: string;
}

/** CreepGroups */
declare interface CreepGroup_Memory extends MemBase {
    assignments: IDictionary<GroupID, CreepGroup_Assignment>;
    homeRoom: RoomID;
    targetRoom: RoomID;
}
declare interface BootSwarmOS_Memory extends CreepGroup_Memory {
    needsInfrastructureBoot?: boolean
}

declare interface ControlGroup_Memory extends BootSwarmOS_Memory {
    level: number;
    EM?: boolean;
}

declare interface SourceGroup_Memory extends BootSwarmOS_Memory {
    sourceID: string;
    savedPath?: PathStep[];
    constructionIDs?: string[];
}