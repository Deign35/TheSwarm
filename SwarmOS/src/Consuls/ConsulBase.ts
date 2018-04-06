import { ObjectBase } from "SwarmTypes/SwarmTypes";
import { TConsulMemory, HarvestMemory } from "SwarmMemory/ConsulMemory";
import { NotImplementedException } from "Tools/SwarmExceptions";

export class ConsulObject {
    GetSwarmType(): SwarmType.SwarmConsul {
        return SwarmType.SwarmConsul;
    }
}


export abstract class SwarmConsul<T extends TConsulMemory> extends ObjectBase<T, ConsulObject> {
    get IsActive() { return this.memory.isActive; }
    get prototype() { return this._instance }
}

export class HarvestConsul extends SwarmConsul<HarvestMemory> {

}