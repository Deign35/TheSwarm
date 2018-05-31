/** RoomViewData */
declare interface RoomStateMemory extends MemBase {
    roomStateData: {
        [id in RoomID]: RoomState
    }
}

interface RoomState extends MemBase {
    lastUpdated: number;
    cSites: ObjectID[];
    mineralIDs: ObjectID[];
    resources: ObjectID[];
    sourceIDs: ObjectID[];
    tombstones: ObjectID[];
    needsRepair: ObjectID[];
    minUpdateOffset: number;
    structures: RoomState_StructureData;
    groups: RoomState_AttachedCreepGroups;
    activityPID: PID;

    owner?: PlayerID;
    hostPID?: PID;
}
type RoomState_StructureData = {
    [id in StructureConstant]?: ObjectID[];
}

declare type RoomState_AttachedCreepGroups = {
    [CG_Control]?: PID;
    [CG_Infrastructure]?: PID;
    [CG_Refill]?: PID[];
    [CG_Source]?: PID[];
    [CG_SimpleSource]?: PID[];
    [CG_SelfDefense]?: PID;
}

declare interface RoomThreadMemory extends CreepGroup_Memory {
}