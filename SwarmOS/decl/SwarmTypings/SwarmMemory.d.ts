declare interface IData<T extends SwarmDataType, U extends number | string> {
    id: string;
    MEM_TYPE: T;
    SUB_TYPE: U;
}

declare interface ISwarmData<T extends SwarmDataType, U extends SwarmType, V extends SwarmSubType> extends IData<T, V> {
    isActive: boolean;
}
declare type TBasicSwarmData = TRoomObjectData | TStructureData | TRoomData | TCreepData | TFlagData | TConsulData;

declare type SwarmDataTypes = MasterSwarmDataTypes | TBasicSwarmData;

declare type SwarmDataTypeSansMaster = SwarmDataType.Consul | SwarmDataType.Creep | SwarmDataType.Flag |
    SwarmDataType.Room | SwarmDataType.RoomObject | SwarmDataType.Structure;

/*
declare type TSwarmObject_1<T extends SwarmDataTypeSansMaster, U extends SwarmType, V extends SwarmSubType,
    Y extends Room | RoomObject | ConsulObject> = SwarmTypeBase<T, U, V, SwarmMemory<T, U, V>, Y>;

declare type SwarmCreep_Type = SwarmCreep<CreepType>;

declare type TSwarmStructure_1<T extends SwarmStructureType, U extends StructureConstant> =
    SwarmStructure<T, U, StructureMemoryBase<T, U>, Structure<U>>;
declare type TSwarmStructure_2<T extends SwarmStructureType> = TSwarmStructure_1<T, StructureConstant>;
declare type SwarmStructure_Type = TSwarmStructure_2<SwarmStructureType>;

declare type TRoomObject_1<T extends SwarmRoomObjectType, U extends RoomObjectMemoryBase<T>,
    V extends _rmType> = SwarmRoomObject<T, U, V>;
declare type TRoomObject_2<T extends SwarmRoomObjectType, U extends _rmType> =
    TRoomObject_1<T, RoomObjectMemoryBase<T>, U>;
declare type SwarmRoomObject_Type = TRoomObject_2<SwarmRoomObjectType, _rmType>;

declare type SwarmRoom_Type = SwarmRoom<RoomType>;
declare type SwarmFlag_Type = SwarmFlag<FlagType>;
//declare type SwarmConsul_Type = SwarmConsul<ConsulType>;
declare type SwarmObject_Type = SwarmCreep_Type | SwarmStructure_Type | SwarmRoom_Type | SwarmFlag_Type |
    SwarmRoomObject_Type;*/