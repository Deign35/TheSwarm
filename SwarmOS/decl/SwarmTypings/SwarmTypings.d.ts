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

declare interface AIBase<T extends SwarmDataTypes, U extends SwarmObjectType> extends _Constructor<U> {
    id: string,
    isActive: boolean;

    Activate(mem: T, obj: U): T;
    InitAsNew(obj: U): T;
    PrepObject(mem: T, obj: U): T;
    GetMemType(): SwarmDataType;
}

declare type AIObject = AIConsul | AICreep | AIFlag | AIRoom | AIRoomObject | AIStructure;


/*    
declare type TObjectBase<T extends SwarmDataType, U extends SwarmSubType, V extends SwarmObjectType> =
    ObjectBase<T, U, TMemoryBase<T, U>, V>;
/*declare type SwarmListMapping<T extends SwarmDataType, U extends SwarmSubType, V extends SwarmObjectType> =
    { [id: U]: TObjectBase<T, U, V> }*

// Consul
declare type TConsulObject<T extends ConsulType> = TObjectBase<SwarmDataType.Consul, T, ConsulObject<T>>
declare type ConsulObject_Type = TConsulObject<ConsulType>;

// Creep
declare type TCreepObject<T extends CreepType> = TObjectBase<SwarmDataType.Creep, T, SwarmCreep<T>>;
declare type CreepObject_Type = TCreepObject<CreepType>;

// Flag
declare type TFlagObject<T extends FlagType> = TObjectBase<SwarmDataType.Flag, T, SwarmFlag<T>>;
declare type FlagObject_Type = TFlagObject<FlagType>;

// Room
declare type TRoomObject<T extends RoomType> = TObjectBase<SwarmDataType.Room, T, SwarmRoom<T>>;
declare type RoomObject_Type = TRoomObject<RoomType>;

// RoomObject
declare type TRoomObjectObject<T extends SwarmRoomObjectType> = TObjectBase<SwarmDataType.RoomObject, T,
    SwarmRoomObject<T>>;
declare type RoomObjectObject_Type = TRoomObjectObject<RoomObjectType>;

// Structure
declare type TStructureObject<T extends StructureType> = TObjectBase<SwarmDataType.Structure, T, SwarmStructure<T>>;
declare type StructureObject_Type = TStructureObject<StructureType>;



*/