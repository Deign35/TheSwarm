declare interface IMasterData<T extends TBasicSwarmData> extends IData<SwarmDataType.Master> {
    ChildData: { [id: string]: T }
    MEM_TYPE: SwarmDataType.Master;
}
declare interface IMasterRoomObjectData extends IMasterData<TRoomObjectData> { }
declare interface IMasterFlagData extends IMasterData<TFlagData> { }
declare interface IMasterStructureData extends IMasterData<TStructureData> { }
declare interface IMasterRoomData extends IMasterData<TRoomData> { }
declare interface IMasterCreepData extends IMasterData<TCreepData> { }
declare interface IMasterConsulData extends IMasterData<TConsulData> { }

declare type MasterSwarmDataTypes = IMasterRoomObjectData | IMasterFlagData | IMasterStructureData |
    IMasterRoomData | IMasterCreepData | IMasterConsulData



