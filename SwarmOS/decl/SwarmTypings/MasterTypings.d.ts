declare interface IMasterData<T extends SwarmDataType> extends IData<SwarmDataType.Master, T> {
    ChildData: { [id: string]: IData<T, SwarmSubType> }
    MEM_TYPE: SwarmDataType.Master;
}
declare interface IMasterRoomObjectData extends IMasterData<SwarmDataType.RoomObject> { }
declare interface IMasterFlagData extends IMasterData<SwarmDataType.Flag> { }
declare interface IMasterStructureData extends IMasterData<SwarmDataType.Structure> { }
declare interface IMasterRoomData extends IMasterData<SwarmDataType.Room> { }
declare interface IMasterCreepData extends IMasterData<SwarmDataType.Creep> { }
declare interface IMasterConsulData extends IMasterData<SwarmDataType.Consul> { }

declare type MasterSwarmDataTypes = IMasterRoomObjectData | IMasterFlagData | IMasterStructureData |
    IMasterRoomData | IMasterCreepData | IMasterConsulData



