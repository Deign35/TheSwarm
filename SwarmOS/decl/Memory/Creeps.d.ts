/** Jobs */
declare interface CreepJob_Memory extends MemBase {
    cID: CreepID        //creep id
    isSpawning?: boolean
    loc: RoomID;        //location
    home: RoomID;
    obj: ObjectID;      //objective
    pri: Priority;     // spawn (p)riority
    tt: TargetType;
    exp?: boolean;      // expires when the creep dies?

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
}

declare interface CreepGroup_Assignment extends MemBase {
    pid?: PID;
    c?: CreepID;
    ct: CT_ALL;
    lvl: number;
    tt: TargetType; // target type
}

/** CreepGroups */
declare interface CreepGroup_Memory extends MemBase {
    assignments: IDictionary<GroupID, CreepGroup_Assignment>;
    homeRoom: RoomID;
    targetRoom: RoomID;
    creeps: IDictionary<CreepID, CreepGroupCreepState>;
}
declare interface BootSwarmOS_Memory extends CreepGroup_Memory {
    needsInfrastructureBoot?: boolean
}

declare interface ControlGroup_Memory extends CreepGroup_Memory {

}
declare interface InfrastructureGroup_Memory extends CreepGroup_Memory {

}
declare interface ExtractionGroup_Memory extends CreepGroup_Memory {
}
declare interface MaintenanceGroup_Memory extends CreepGroup_Memory {
    repairQueue: string[];
}

declare interface CreepGroupCreepState extends MemBase {
    name: CreepID;
    active: boolean;
    aID: string;
    idle?: number;
}

/** Creep Scripts */
declare interface CreepScript_Memory extends CreepGroup_Memory {
}