import { ObjectBase, SwarmTypeBase } from "SwarmTypes/SwarmTypes";
import { NotImplementedException } from "Tools/SwarmExceptions";
import { SwarmMemoryBase, MemoryBase } from "SwarmMemory/SwarmMemory";

export class ConsulObject<T extends ConsulType>
    implements _Constructor<AIConsulBaseObject<T>>, AIConsulBaseObject<T> {
    constructor(public readonly ConsulType: T) { }
    get prototype(): AIConsulBaseObject<T> {
        throw new NotImplementedException('Consuls do not have a prototype');
        //return this;
    }
}

//ISwarmData < SwarmDataType.Consul, SwarmType.SwarmConsul, T >
export abstract class SwarmConsul<T extends ConsulType>
    extends SwarmTypeBase<TConsulData, ConsulObject<T>> {
    get IsActive() { return this.memory.isActive; }
    get prototype() { return this._instance }
}