declare type SwarmSubType = SwarmType | ConsulType | StructureConstant |
    FlagType | RoomType | CreepType | SwarmDataType
declare interface IData<T extends SwarmDataType, U extends number | string> {
    id: string;
    MEM_TYPE: T;
    SUB_TYPE: U;
}
declare interface ISwarmData<T extends SwarmDataType, U extends SwarmType, V extends SwarmSubType> extends IData<T, V> {
    isActive: boolean;
    SWARM_TYPE: U
}
declare type TBasicSwarmData = TRoomObjectData | TStructureData | TRoomData | TCreepData | TFlagData | TConsulData;

declare type SwarmDataTypes = MasterSwarmDataTypes | TBasicSwarmData;

declare type SwarmDataTypeSansMaster = SwarmDataType.Consul | SwarmDataType.Creep | SwarmDataType.Flag |
    SwarmDataType.Room | SwarmDataType.RoomObject | SwarmDataType.Structure;

declare type SwarmRoomObjectType = SwarmType.SwarmSite | SwarmType.SwarmMineral | SwarmType.SwarmNuke |
    SwarmType.SwarmResource | SwarmType.SwarmSource | SwarmType.SwarmTombstone

declare type SwarmStructureType = SwarmType.SwarmContainer | SwarmType.SwarmController | SwarmType.SwarmExtension |
    SwarmType.SwarmExtractor | SwarmType.SwarmKeepersLair | SwarmType.SwarmLab | SwarmType.SwarmLink |
    SwarmType.SwarmNuker | SwarmType.SwarmObserver | SwarmType.SwarmPortal | SwarmType.SwarmPowerBank |
    SwarmType.SwarmPowerSpawn | SwarmType.SwarmRampart | SwarmType.SwarmRoad | SwarmType.SwarmSpawn |
    SwarmType.SwarmStorage | SwarmType.SwarmTerminal | SwarmType.SwarmTower | SwarmType.SwarmWall

declare type SwarmObjectType = Room | RoomObject | AIConsulObject
declare interface AIBase<T extends TBasicSwarmData, U extends SwarmObjectType> extends _Constructor<U> {
    Activate(mem: T, obj: U): T;
    InitAsNew(obj: U): T;
    PrepObject(mem: T, obj: U): T;
    GetMemType(): SwarmDataTypeSansMaster;
    GetSwarmType(): SwarmType;
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