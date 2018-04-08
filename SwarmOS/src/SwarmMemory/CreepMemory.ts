import { SwarmMemoryWithSpecifiedData } from "SwarmMemory/SwarmMemory";

abstract class CreepMemoryBase<T extends CreepType, U extends ICreepData<T>>
    extends SwarmMemoryWithSpecifiedData<U> implements ICreepData<T>{
    get MEM_TYPE(): SwarmDataType.Creep { return SwarmDataType.Creep; }
    get SWARM_TYPE(): SwarmType.SwarmCreep { return SwarmType.SwarmCreep; } //{ return this.cache.SWARM_TYPE; }
    get SUB_TYPE(): T { return this.cache.SUB_TYPE; }
}
abstract class CreepMemoryWithSpecifiedData<T extends TCreepData>
    extends CreepMemoryBase<CreepType, T> implements TCreepData {
}

export class CreepMemory extends CreepMemoryWithSpecifiedData<TCreepData>
    implements TCreepData {
}

//declare type CreepMemory = ConsulMemoryWithSpecifiedData<TCreepData>;