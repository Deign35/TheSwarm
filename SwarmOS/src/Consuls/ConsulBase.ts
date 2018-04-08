import { ObjectBase, SwarmTypeBase } from "SwarmTypes/SwarmTypes";
import { NotImplementedException } from "Tools/SwarmExceptions";

export class ConsulObject implements _Constructor<AIConsulBaseObject<ConsulType>>, AIConsulBaseObject<ConsulType> {
    constructor(public readonly ConsulType: ConsulType) { }
    get prototype(): AIConsulBaseObject<ConsulType> {
        return this;
    }
}

//ISwarmData < SwarmDataType.Consul, SwarmType.SwarmConsul, T >
export abstract class SwarmConsulBase<T extends ConsulType>
    extends SwarmTypeBase<IData, ConsulObject> {
    get IsActive() { return this.memory.isActive; }
    get prototype() { return this._instance }
    GetSwarmSubType(): T {
        return this._instance.ConsulType as T;
    }
}

export type SwarmConsul = SwarmConsulBase<ConsulType>;