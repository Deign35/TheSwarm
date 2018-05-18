
/** RoomViewData */
declare type RoomViewData_Memory = MemBase & {
    [id in RoomID]: RVD_RoomMemory
}

interface RVD_RoomMemory extends MemBase {
    cSites: RVD_StructureData[];
    lastUpdated: number;
    mineralIDs: ObjectID[];
    minUpdateOffset: number;
    owner?: PlayerID;
    pid?: PID;
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
