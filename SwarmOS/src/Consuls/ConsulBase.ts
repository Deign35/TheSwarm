import { ObjectBase } from "SwarmTypes/SwarmTypes";
import { TConsulMemory } from "SwarmMemory/ConsulMemory";
import { NotImplementedException } from "Tools/SwarmExceptions";

export abstract class SwarmConsul<T extends TConsulMemory> extends ObjectBase<T, any> {
    get IsActive() { return this.memory.isActive; }
    get prototype() { throw new NotImplementedException('OtherObjects do not have prototypes'); }
}