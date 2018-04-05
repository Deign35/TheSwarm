import { ObjectBase } from "SwarmTypes/SwarmTypes";
import { BasicMemory } from "SwarmMemory/SwarmMemory";
import { profile } from "Tools/Profiler";
import { NotImplementedException } from "Tools/SwarmExceptions";

@profile
export class OtherObject<T extends BasicMemory> extends ObjectBase<T, any> {
    get IsActive() { return this.memory.isActive; }
    get prototype() { throw new NotImplementedException('OtherObjects do not have prototypes'); }
} // An empty object for accessing the Basic Memory object.