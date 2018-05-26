
/** RoomViewData */
declare type RoomViewData_Memory = MemBase & {
    [id in RoomID]: RoomState
}

interface RVD_RoomMemory extends MemBase {
    cSites: RVD_StructureData[];
    lastUpdated: number;
    mineralIDs: ObjectID[];
    minUpdateOffset: number;
    owner?: PlayerID;
    resources: ObjectID[];
    sourceIDs: ObjectID[];
    structures: RVD_StructureMemory
    tombstones: ObjectID[];

    [STRUCTURE_CONTROLLER]?: ObjectID;
    [STRUCTURE_STORAGE]?: ObjectID;
    [STRUCTURE_TERMINAL]?: ObjectID;
}
interface RVD_StructureData extends MemBase {
    id: ObjectID;
    hits?: number
    room?: RoomID;
    x?: number;
    y?: number;
}
interface RVD_StructureMemory extends MemBase {
    [STRUCTURE_CONTAINER]: RVD_StructureData[];
    [STRUCTURE_ROAD]: RVD_StructureData[];

    [STRUCTURE_EXTENSION]?: RVD_StructureData[];
    [STRUCTURE_LAB]?: RVD_StructureData[];
    [STRUCTURE_LINK]?: RVD_StructureData[];
    [STRUCTURE_RAMPART]?: RVD_StructureData[];
    [STRUCTURE_SPAWN]?: RVD_StructureData[];
    [STRUCTURE_TOWER]?: RVD_StructureData[];
    [STRUCTURE_WALL]?: RVD_StructureData[];
}

declare interface RoomGroupListing {
    [id: string]: {
        [id in CreepGroupPackage]?: PID
    }
}

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
    owner?: PlayerID;
    structures: RoomState_StructureData;
    groups: RoomState_AttachedCreepGroups;
    hostPID: PID;
}
interface RoomState_StructureData extends MemBase {
    [STRUCTURE_CONTAINER]: ObjectID[];
    [STRUCTURE_ROAD]: ObjectID[];
    [STRUCTURE_CONTROLLER]?: ObjectID; // (TODO) Create a fake controller for when there isn't one?  All rooms have a controller, either mine or the StructureController.

    [STRUCTURE_EXTENSION]?: ObjectID[];
    [STRUCTURE_LAB]?: ObjectID[];
    [STRUCTURE_LINK]?: ObjectID[];
    [STRUCTURE_RAMPART]?: ObjectID[];
    [STRUCTURE_SPAWN]?: ObjectID[];
    [STRUCTURE_TOWER]?: ObjectID[];
    [STRUCTURE_WALL]?: ObjectID[];
    [STRUCTURE_STORAGE]?: ObjectID;
    [STRUCTURE_TERMINAL]?: ObjectID;
}

declare type RoomState_AttachedCreepGroups = {
    [id in CreepGroupPackage]?: PID
}


declare interface RoomThreadMemory extends CreepGroup_Memory {
}