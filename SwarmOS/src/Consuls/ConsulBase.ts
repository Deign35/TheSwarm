import { ObjectBase, SwarmTypeBase } from "SwarmTypes/SwarmTypes";
import { NotImplementedException } from "Tools/SwarmExceptions";

export class ConsulObject implements _Constructor<AIConsulObject>,
    AIConsulObject {
    constructor(public readonly ConsulType: ConsulType) { }
    get prototype(): AIConsulObject {
        return this;
    }
}

export abstract class SwarmConsulBase<T extends ConsulType>
    extends SwarmTypeBase<IData, ConsulObject> implements AIConsulBase<T> {
    get IsActive() { return this.memory.isActive; }
    get prototype() { return this._instance }
}

export type SwarmConsul = SwarmConsulBase<ConsulType> & AIConsul;