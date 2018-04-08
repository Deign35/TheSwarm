import { SwarmMemoryWithSpecifiedData } from "SwarmMemory/SwarmMemory";

abstract class FlagMemoryBase<T extends FlagType, U extends IFlagData<T>>
    extends SwarmMemoryWithSpecifiedData<U> implements IFlagData<T>{
    get MEM_TYPE(): SwarmDataType.Flag { return SwarmDataType.Flag; }
    get SWARM_TYPE(): SwarmType.SwarmFlag { return SwarmType.SwarmFlag; } //{ return this.cache.SWARM_TYPE; }
    get SUB_TYPE(): T { return this.cache.SUB_TYPE; }
}
abstract class FlagMemoryWithSpecifiedData<T extends TFlagData>
    extends FlagMemoryBase<FlagType, T> implements TFlagData {
}

export class FlagMemory extends FlagMemoryWithSpecifiedData<TFlagData>
    implements TFlagData {
}

//declare type FlagMemory = ConsulMemoryWithSpecifiedData<TFlagData>;