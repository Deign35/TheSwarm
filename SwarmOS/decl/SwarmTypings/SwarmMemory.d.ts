declare interface IData<T extends SwarmDataType, U extends number | string> {
    id: string;
    MEM_TYPE: T;
    SUB_TYPE: U;
}

declare interface ISwarmData<T extends SwarmDataType, U extends SwarmType, V extends number | string> extends IData<T, V> {
    isActive: boolean;
}
declare type TBasicSwarmData = TRoomObjectData | TStructureData | TRoomData | TCreepData | TFlagData | TConsulData;

declare type SwarmDataTypes = MasterSwarmDataTypes | TBasicSwarmData;

declare type SwarmDataTypeSansMaster = SwarmDataType.Consul | SwarmDataType.Creep | SwarmDataType.Flag |
    SwarmDataType.Room | SwarmDataType.RoomObject | SwarmDataType.Structure;