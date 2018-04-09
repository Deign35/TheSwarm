declare interface IMasterData<T extends SwarmDataType> extends IData {
    ChildData: { [id: string]: ISwarmData<T, SwarmType, SwarmSubType> };
}
declare type MasterDataType = IMasterData<SwarmDataType>;
declare interface IMasterConsulData extends IMasterData<SwarmDataType.Consul> { }
declare interface IMasterCreepData extends IMasterData<SwarmDataType.Creep> { }
declare interface IMasterFlagData extends IMasterData<SwarmDataType.Flag> { }
declare interface IMasterRoomData extends IMasterData<SwarmDataType.Room> { }
declare interface IMasterRoomObjectData extends IMasterData<SwarmDataType.RoomObject> { }
declare interface IMasterStructureData extends IMasterData<SwarmDataType.Structure> { }

declare type MasterSwarmDataTypes = IMasterRoomObjectData | IMasterFlagData | IMasterStructureData |
    IMasterRoomData | IMasterCreepData | IMasterConsulData



