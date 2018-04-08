import { profile } from "Tools/Profiler";
import { MemoryBase, SwarmMemoryBase } from "SwarmMemory/SwarmMemory";
import { MineralMemory, TombstoneMemory, ResourceMemory, NukeMemory } from "SwarmMemory/RoomObjectMemory";
import { ConsulObject } from "Consuls/ConsulBase";

export type ObjBase = ObjectBase<TBasicSwarmData, SwarmObjectType>;
const HAS_PREPPED = 'hasPrepped';
@profile
export abstract class ObjectBase<T extends TBasicSwarmData, U extends SwarmObjectType> {
    constructor(data: T, obj: U) {
        this._memory = data;
        this._instance = obj;
    }
    Activate() {

    }
    InitAsNew() {

    }
    PrepObject() {

    }

    get id(): string { return this.memory.id; }
    get memory(): T { return this._memory; }
    get prototype(): U { return this._instance; }

    protected _memory!: T;
    protected _instance!: U;

    GetMemType(): SwarmDataTypeSansMaster {
        return this.memory.MEM_TYPE;
    }
}
@profile
export abstract class SwarmTypeBase<T extends TBasicSwarmData, U extends SwarmObjectType>
    extends ObjectBase<T, U> implements AIBase<T, U> {
    get IsActive() { return this.memory.isActive; }
    GetSwarmType(): SwarmType { return this.memory.SWARM_TYPE; }
}
@profile
export abstract class SwarmRoomObjectBase<T extends TBasicSwarmData, U extends RoomObject>
    extends SwarmTypeBase<T, U> implements RoomObject {
    get pos(): RoomPosition { return this._instance.pos; }
    get room(): Room | undefined { return this._instance.room; }
}
@profile
export abstract class OwnableSwarmObject<T extends TCreepData | TOwnabledStructureData,
    U extends Creep | OwnedStructure> extends SwarmRoomObjectBase<T, U> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        return this._instance.notifyWhenAttacked(enabled) as OK;
    }
}