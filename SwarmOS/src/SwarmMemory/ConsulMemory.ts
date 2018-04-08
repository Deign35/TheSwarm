import { SwarmMemoryWithSpecifiedData } from "SwarmMemory/SwarmMemory";

abstract class ConsulMemoryBase<T extends ConsulType, U extends IConsulData<T>>
    extends SwarmMemoryWithSpecifiedData<U> {
    get MEM_TYPE(): SwarmDataType.Consul { return SwarmDataType.Consul; }
    get SWARM_TYPE(): SwarmType.SwarmConsul { return SwarmType.SwarmConsul; }
    abstract get SUB_TYPE(): T;
}
abstract class ConsulMemoryWithSpecifiedData<T extends TConsulData>
    extends ConsulMemoryBase<ConsulType, T> {
}

export class HarvestConsulMemory extends ConsulMemoryWithSpecifiedData<HarvestConsulData> implements HarvestConsulData {
    get sourceIDs() { return this.cache.sourceIDs; }
    get SUB_TYPE(): ConsulType.Harvest { return ConsulType.Harvest; }
}
export class ControlConsulMemory extends ConsulMemoryWithSpecifiedData<ControlConsulData> implements ControlConsulData {
    get creepIDs(): string[] { return this.cache.creepIDs; }
    get SUB_TYPE(): ConsulType.Control { return ConsulType.Control; }
}

export type ConsulMemory = ConsulMemoryWithSpecifiedData<TConsulData>;