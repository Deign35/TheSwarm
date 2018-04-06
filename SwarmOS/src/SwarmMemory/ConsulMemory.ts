import { MemoryBase, SwarmMemory } from "./SwarmMemory";

export type TConsulMemory = HarvestMemory | ControlMemory;

export abstract class ConsulMemory<T extends ConsulType, U extends ISwarmData<SwarmDataType.Consul, SwarmType.SwarmConsul, T>>
    extends SwarmMemory<SwarmDataType.Consul, SwarmType.SwarmConsul, T, U> {
    get SWARM_TYPE(): SwarmType.SwarmConsul { return SwarmType.SwarmConsul; }
}
export class HarvestMemory extends ConsulMemory<ConsulType.Harvest, HarvestConsulData> implements HarvestConsulData {
    get sourceIDs() { return this.cache.sourceIDs; }
    get SUB_TYPE(): ConsulType.Harvest { return ConsulType.Harvest; }
}

export class ControlMemory extends ConsulMemory<ConsulType.Control, ControlConsulData> implements ControlConsulData {
    get creepIDs(): string[] { return this.cache.creepIDs; }
    get SUB_TYPE(): ConsulType.Control { return ConsulType.Control; }
}