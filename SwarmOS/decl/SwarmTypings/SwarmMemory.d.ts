declare interface IData<T extends SwarmDataType> extends Dictionary {
    id: string;
    MEM_TYPE: T;
    SWARM_TYPE: SwarmType;
}

declare interface ISwarmData<T extends SwarmDataType, U extends SwarmType, V extends number | string> extends IData<T> {
    SWARM_TYPE: U;
    SUB_TYPE: V;
    isActive: boolean;
}
declare type TBasicSwarmData = TRoomObjectData | TStructureData | TRoomData | TCreepData | TFlagData | TConsulData;

declare type SwarmDataTypes = MasterSwarmDataTypes | TBasicSwarmData;