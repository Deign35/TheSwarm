declare type TCreepData = ICreepData<CreepType>;
declare interface ICreepData<T extends CreepType> extends ISwarmData<SwarmDataType.Creep, SwarmType.SwarmCreep, T> { }
