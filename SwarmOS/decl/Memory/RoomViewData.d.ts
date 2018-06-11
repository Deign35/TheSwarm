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
}
type RoomState_StructureData = {
    [id in StructureConstant]?: ObjectID[];
}

declare type WorkerTargetDictionary = IDictionary<ObjectID, WorkerTarget_Memory>;
declare interface AttachedCreepGroup_Memory {
    pid: PID;

    energy: WorkerTargetDictionary;
    targets: WorkerTargetDictionary;
}

declare interface RoomState_AttachedCreepGroups {
    [CR_BootFill]?: AttachedCreepGroup_Memory;
    [CR_Harvester]?: IDictionary<ObjectID, PID>;
    [CR_Scout]?: PID;
    [CR_SpawnFill]?: AttachedCreepGroup_Memory;
    [CR_Work]?: AttachedCreepGroup_Memory;


    [CR_Fortify]?: AttachedCreepGroup_Memory;
    [CR_Science]?: PID;
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