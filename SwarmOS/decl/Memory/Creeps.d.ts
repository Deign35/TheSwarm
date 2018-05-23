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
}
declare interface ControlGroup_Memory extends CreepGroup_Memory {

}
declare interface InfrastructureGroup_Memory extends CreepGroup_Memory {

}
declare interface ExtractionGroup_Memory extends CreepGroup_Memory {
}