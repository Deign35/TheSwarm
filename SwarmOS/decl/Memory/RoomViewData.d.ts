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
    [CJ_Boot]?: PID[];
    [CJ_Fortify]?: PID;
    [CJ_Harvest]?: PID[];
    [CJ_Refill]?: PID;
    [CJ_Science]?: PID;
    [CJ_Work]?: PID;
}