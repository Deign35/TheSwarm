/** RoomViewData */
declare interface RoomStateMemory extends MemBase {
    roomStateData: {
        [id in RoomID]: RoomState
    }
    cartographicMemory: CartographerMemory;
}

interface RoomState extends MemBase {
    lastUpdated: number;
    lastEnergy: number;

    cSites: ObjectID[];
    mineralIDs: ObjectID[];
    resources: ObjectID[];
    sourceIDs: ObjectID[];
    tombstones: ObjectID[];
    needsRepair: ObjectID[];
    minUpdateOffset: number;
    structures: RoomState_StructureData;
    groups: RoomState_AttachedCreepGroups;
    targets: {
        CR_SpawnFill: AttachedCreepGroup_Memory
        CR_Work: AttachedCreepGroup_Memory
        Other: {
            target: ObjectID;
            at: ActionType;
            t: TargetType;
            en: number;     // Energy required to complete the job
        };
        Fill: {
            target: ObjectID;
            at: ActionType;
            t: TargetType;
            c: number; // (c)ount,
        };
    }
    activityPID: PID;
    owner?: PlayerID;

    RoomType: {
        type: RoomType;
        other: {
            sources?: IDictionary<ObjectID, PID>;
            tr: RoomID;
        }
    }
}
interface RoomState_StructureData {
    [STRUCTURE_CONTAINER]: ObjectID[];
    [STRUCTURE_ROAD]: ObjectID[]

    [STRUCTURE_EXTENSION]?: ObjectID[];
    [STRUCTURE_LAB]?: ObjectID[];
    [STRUCTURE_LINK]?: ObjectID[];
    [STRUCTURE_RAMPART]?: ObjectID[];
    [STRUCTURE_SPAWN]?: ObjectID[];
    [STRUCTURE_TOWER]?: ObjectID[];
    [STRUCTURE_WALL]?: ObjectID[];
    [id: string]: ObjectID[] | undefined;
}


declare interface WorkerTarget_Memory extends MemBase {
    a: ActionType;  // (a)ctionType
    t: TargetType;  // (o)bject type
    p: Priority;    // (p)riority
}
declare type WorkerTargetDictionary = IDictionary<ObjectID, WorkerTarget_Memory>;
declare interface AttachedCreepGroup_Memory {
    energy: WorkerTargetDictionary;
    targets: WorkerTargetDictionary;
}

declare interface RoomState_AttachedCreepGroups {
    [CR_Harvester]?: IDictionary<ObjectID, PID>;
    [CR_Scout]?: PID;
    [CR_SpawnFill]?: PID;

    [CR_Fortify]?: PID;
    [CR_Science]?: PID;

    [RJ_Tower]?: PID;

    [CR_Work]: PID;
    [RJ_Misc]: PID;
    [RJ_Structures]: PID;
    [RJ_WorkTarget]: PID;
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