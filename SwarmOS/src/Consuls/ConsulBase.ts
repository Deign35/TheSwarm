import { ObjectBase, SwarmTypeBase } from "SwarmTypes/SwarmTypes";
import { TConsulMemory, HarvestMemory, ConsulMemory } from "SwarmMemory/ConsulMemory";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { SwarmMemory, MemoryBase } from "SwarmMemory/SwarmMemory";

export class ConsulObject {
    GetSwarmType(): SwarmType.SwarmConsul {
        return SwarmType.SwarmConsul;
    }
}

//ISwarmData < SwarmDataType.Consul, SwarmType.SwarmConsul, T >
export abstract class SwarmConsul<T extends ConsulType, U extends ConsulMemory<T>>
    extends SwarmTypeBase<SwarmDataType.Consul, SwarmType.SwarmConsul, T, U, ConsulObject> {
    get IsActive() { return this.memory.isActive; }
    get prototype() { return this._instance }
}