declare type TCreepData = ICreepData<CreepType>;
declare interface ICreepData<T extends CreepType> extends ISwarmData<SwarmDataType.Creep, SwarmType.SwarmCreep, T> { }

declare interface AICreepBase<T extends CreepType> extends AIBase<ICreepData<T>, Creep> {

}

declare type AICreep = AICreepBase<CreepType>;