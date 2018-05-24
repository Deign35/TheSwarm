/** Jobs */
declare interface CreepJob_Memory extends MemBase {
    c: CreepID | SpawnRequestID
    l: RoomID;
    h: RoomID;
    t: ObjectID;
    j: JobState;
    p: Priority;     // spawn (p)riority

    ct: CT_ALL;
    lvl: number;
    id: string;

    a?: PID;         // (a)ction thread
}
declare interface HarvesterJob_Memory extends CreepJob_Memory {
    cont?: string   //containerID
}

declare interface CreepThread_JobMemory extends MemBase {
    a: ActionType;
    c: CreepID;
    l: RoomID;
    t?: ObjectID;
}

declare interface NewCreepGroup_Assignment extends MemBase {
    pid?: PID;
    c?: CreepID;
    ct: CT_ALL;
    lvl: number;
}

/** CreepGroups */
declare interface CreepGroup_Memory extends MemBase {
    assignments: IDictionary<GroupID, NewCreepGroup_Assignment>;
    homeRoom: RoomID;
    targetRoom: RoomID;
    creeps: IDictionary<CreepID, CreepGroupCreepState>;
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
    targetTypes: IDictionary<string, string>;
}