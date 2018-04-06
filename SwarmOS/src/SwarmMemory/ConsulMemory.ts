import { MemoryBase } from "./SwarmMemory";

export type TConsulMemory = HarvestMemory | ControlMemory;

export abstract class ConsulMemory<T extends TConsulData> extends MemoryBase<T> {
    get MEM_TYPE(): SwarmDataType.Consul { return SwarmDataType.Consul }
    get SWARM_TYPE(): SwarmType.SwarmConsul { return SwarmType.SwarmConsul }
    abstract get SUB_TYPE(): ConsulType;
}
export class HarvestMemory extends ConsulMemory<HarvestConsulData> implements HarvestConsulData {
    get sourceIDs() { return this._cache.sourceIDs; }
    get SUB_TYPE(): ConsulType.Harvest { return ConsulType.Harvest; }
}

export class ControlMemory extends ConsulMemory<ControlConsulData> implements ControlConsulData {
    get creepIDs(): string[] { return this._cache.creepIDs; }
    get SUB_TYPE(): ConsulType.Control { return ConsulType.Control; }
}