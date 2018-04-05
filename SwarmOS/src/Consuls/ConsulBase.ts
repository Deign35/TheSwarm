import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { BasicMemory } from "SwarmMemory/SwarmMemory";
import { ObjectBase } from "SwarmTypes/SwarmTypes";
import { TConsulMemory } from "SwarmMemory/ConsulMemory";

export abstract class SwarmConsul<T extends TConsulMemory> extends ObjectBase<T, any> {

}