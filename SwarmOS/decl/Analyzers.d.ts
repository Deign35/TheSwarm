declare interface RoomDataMemory {
    rID: RoomID;        // Room ID
    o?: string;         // Owner
    s?: IDictionary<StructureConstant, StructureData[]>,    // Structures
    f: number;          // Frequency offset
    e: ObjectID[];      // Source IDs (e for energy)
    m: ObjectID[];      // Mineral IDs
    x: { "1"?: string, "3"?: string, "5"?: string, "7"?: string };          // e(x)its
}
declare interface StructureData {
    id: string;
    pos: number;
    hits: number;
}

declare interface RoomRAMData {
    resources: ResourceData[];
    tombstones: TombstoneData[];
}

declare interface ResourceData {
    id: string;
    pos: number;
    type: ResourceConstant;
    amt: number;
}
declare interface TombstoneData {
    id: string;
    pos: number;
    val: number;
}

declare var RoomDataPath: IFolder;