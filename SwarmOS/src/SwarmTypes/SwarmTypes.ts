import { ConsulObject } from "Consuls/ConsulBase";
import { MemoryObject, MemoryBase } from "SwarmMemory/SwarmMemory";
import { SwarmLoader } from "./SwarmLoader";

export type ObjBase = ObjectBase<IData, SwarmObjectType>;

export abstract class ObjectBase<T extends IData, U extends SwarmObjectType> implements AIObject {
    constructor(data: MemoryBase<T>, obj: U) {
        this._memory = data;
        this._instance = obj;
    }
    InitAsNew() {

    }
    RefreshObject(): void {

    }
    PrepObject() {

    }
    ActivateObject() {

    }
    FinalizeObject(): void {

    }
    AssignCreep(name: string): boolean {
        return false;
    }

    get id(): string { return this.memory.id; }
    get memory(): MemoryBase<T> { return this._memory; }
    get prototype(): U { return this._instance; }
    get updateFrequency(): number { return 10; }

    protected _memory!: MemoryBase<T>;
    protected _instance!: U;

    abstract GetMemType(): SwarmDataType;
    abstract GetSwarmType(): SwarmType;
    abstract GetSubType(): SwarmSubType;
}

export abstract class SwarmTypeBase<T extends IData, U extends SwarmObjectType> extends ObjectBase<T, U> {
    GetMemType(): SwarmDataType { return this.memory.MEM_TYPE; }
    GetSubType(): SwarmSubType { return this.memory.SUB_TYPE; }
    GetSwarmType(): SwarmType { return this.memory.SWARM_TYPE; }
    get IsActive() { return this.memory.isActive; }
}

export abstract class SwarmRoomObjectBase<T extends IData, U extends RoomObject>
    extends SwarmTypeBase<T, U> implements RoomObject {
    get pos(): RoomPosition { return this._instance.pos; }
    get room(): Room | undefined { return this._instance.room; }
}

export abstract class OwnableSwarmObject<T extends IData,
    U extends Creep | OwnedStructure> extends SwarmRoomObjectBase<T, U> {
    get my() { return this._instance.my; }
    get owner() { return this._instance.owner; }
    notifyWhenAttacked(enabled: boolean = false) { // ActionIntent
        return this._instance.notifyWhenAttacked(enabled) as OK;
    }
}