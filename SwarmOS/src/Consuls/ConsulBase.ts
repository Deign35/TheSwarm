import { ObjectBase, SwarmTypeBase } from "SwarmTypes/SwarmTypes";
import { TConsulMemory, HarvestMemory, ConsulMemory } from "SwarmMemory/ConsulMemory";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { SwarmMemoryBase, MemoryBase } from "SwarmMemory/SwarmMemory";

export abstract class ConsulObject<T extends ConsulType> implements AIConsulBaseObject<T> {
    get prototype() {
        throw new NotImplementedException('Consuls do not have a prototype');
        //return this;
    }
    abstract get ConsulType(): T;
}

//ISwarmData < SwarmDataType.Consul, SwarmType.SwarmConsul, T >
export abstract class SwarmConsul<T extends ConsulType>
    extends SwarmTypeBase<TConsulData, ConsulObject<T>> {
    get IsActive() { return this.memory.isActive; }
    get prototype() { return this._instance }
}