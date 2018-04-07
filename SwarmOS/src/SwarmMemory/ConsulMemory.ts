import { MemoryBase, SwarmMemory } from "./SwarmMemory";

export type TConsulMemory = HarvestMemory | ControlMemory;

export abstract class ConsulMemory<T extends ConsulType>
    extends SwarmMemory<SwarmDataType.Consul, SwarmType.SwarmConsul, T> {
    get SWARM_TYPE(): SwarmType.SwarmConsul { return SwarmType.SwarmConsul; }
}
export class HarvestMemory extends ConsulMemory<ConsulType.Harvest> implements HarvestConsulData {
    protected get cache(): HarvestConsulData {
        return super.cache as HarvestConsulData;
    }
    get sourceIDs() { return this.cache.sourceIDs; }
    get SUB_TYPE(): ConsulType.Harvest { return ConsulType.Harvest; }
}

export class ControlMemory extends ConsulMemory<ConsulType.Control> implements ControlConsulData {
    get cache(): ControlConsulData {
        return super.cache as ControlConsulData;
    }
    get creepIDs(): string[] { return this.cache.creepIDs; }
    get SUB_TYPE(): ConsulType.Control { return ConsulType.Control; }
}