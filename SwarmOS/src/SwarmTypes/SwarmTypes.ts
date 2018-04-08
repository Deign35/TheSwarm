import { profile } from "Tools/Profiler";
import { ConsulObject } from "Consuls/ConsulBase";
import { MemoryObject, MemoryBase } from "SwarmMemory/SwarmMemory";

export type ObjBase = ObjectBase<IData, SwarmObjectType>;
const HAS_PREPPED = 'hasPrepped';
@profile
export abstract class ObjectBase<T extends IData, U extends SwarmObjectType> {
    constructor(data: MemoryBase<T>, obj: U) {
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
    get memory(): MemoryBase<T> { return this._memory; }
    get prototype(): U { return this._instance; }

    protected _memory!: MemoryBase<T>;
    protected _instance!: U;

    abstract GetMemType(): SwarmDataType;
    abstract GetSwarmType(): SwarmType;
    abstract GetSwarmSubType(): SwarmSubType;
}
@profile
export abstract class SwarmTypeBase<T extends IData, U extends SwarmObjectType> extends ObjectBase<T, U> {
    GetMemType(): SwarmDataType {
        return this.memory.MEM_TYPE;
    }
    GetSubType(): SwarmSubType {
        return this.memory.SUB_TYPE;
    }
    GetSwarmType(): SwarmType {
        return this.memory.SWARM_TYPE;
    }
    get IsActive() { return this.memory.isActive; }
}
@profile
export abstract class SwarmRoomObjectBase<T extends IData, U extends RoomObject>
    extends SwarmTypeBase<T, U> implements RoomObject {
    get pos(): RoomPosition { return this._instance.pos; }
    get room(): Room | undefined { return this._instance.room; }
}
@profile
export abstract class OwnableSwarmObject<T extends IData,
    U extends Creep | OwnedStructure> extends SwarmRoomObjectBase<T, U> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        return this._instance.notifyWhenAttacked(enabled) as OK;
    }
}