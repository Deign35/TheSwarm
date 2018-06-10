/** RoomViewData */
declare interface RoomStateMemory extends MemBase {
    roomStateData: {
        [id in RoomID]: RoomState
    }
    cartographicMemory: CartographerMemory;
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
    [CJ_BootRefill]?: PID[];
    [CJ_BootBuild]?: PID[];
    [CJ_Fortify]?: PID;
    [CJ_Harvest]?: PID[];
    [CJ_Refill]?: PID;
    [CJ_Science]?: PID;
    [CJ_Scout]?: PID;
    [CJ_Work]?: PID;
}

declare interface CartographerMemory extends MemBase {
    creeps: {
        [id in CreepID]: {
            a?: PID;        // (a)ctivity
            home: RoomID;   // (c)reep
        }
    }
    homeRooms: {
        [id in RoomID]: {
            creepID?: CreepID;
            nearbyRooms: RoomID[];
        }
    }
}