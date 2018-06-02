/** CreepGroups */
declare interface CreepGroup_Memory extends MemBase {
    assignments: IDictionary<GroupID, any>;
    homeRoom: RoomID;
    targetRoom: RoomID;
}
declare interface BootSwarmOS_Memory extends CreepGroup_Memory {
    needsInfrastructureBoot?: boolean
}

declare interface ControlGroup_Memory extends BootSwarmOS_Memory {
    level: number;
}
declare interface RefillGroup_Memory extends CreepGroup_Memory {
    creeps: CreepID[];
    structs: ObjectID[];
}
declare interface SelfDefenseGroup_Memory extends BootSwarmOS_Memory {

}

declare interface SourceGroup_Memory extends BootSwarmOS_Memory {
    sourceID: string;
    savedPath?: PathStep[];
    constructionIDs?: string[];
}