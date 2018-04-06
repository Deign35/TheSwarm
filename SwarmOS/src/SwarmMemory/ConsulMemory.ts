import { MemoryBase } from "./SwarmMemory";

export type TConsulMemory = HarvestMemory;

export abstract class ConsulMemory<T extends ConsulType> extends MemoryBase<TConsulData> {
    get MEM_TYPE(): SwarmDataType.Consul { return SwarmDataType.Consul }
    get SWARM_TYPE(): SwarmType.SwarmConsul { return SwarmType.SwarmConsul }
    abstract get SUB_TYPE(): T;
}
export class HarvestMemory extends ConsulMemory<ConsulType.Harvest> implements HarvestConsulData {
    get sourceIDs() { return this._cache.sourceIDs; }
    get SUB_TYPE(): ConsulType.Harvest { return ConsulType.Harvest; }
}