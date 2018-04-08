import { profile } from "Tools/Profiler";
import { MemoryLockException } from "Tools/SwarmExceptions";

@profile
export abstract class MemoryBase {
    constructor() {
        this._checkedOut = false;
        this._flashMemory = {};
    }
    protected abstract get cache(): IData;
    private _flashMemory: Dictionary;
    private _checkedOut: boolean;

    get id(): string { return this.cache.id; }
    get isActive(): boolean { return this.cache.isActive; }
    get IsCheckedOut(): boolean { return this._checkedOut }
    get MEM_TYPE(): SwarmDataType { return this.cache.MEM_TYPE; }
    get SWARM_TYPE(): SwarmType { return this.cache.SWARM_TYPE; }
    get SUB_TYPE(): SwarmSubType { return this.cache.SUB_TYPE; }

    ReserveMemory(): void {
        if (this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory already checked out");
        }
        this._checkedOut = true;
    }
    ReleaseMemory(): SwarmData {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory not checked out");
        }

        this._checkedOut = false;
        return this.cache;
    }

    GetMemoryIDs(): string[] { return Object.keys(this.cache); }
    HasMemory(id: string): boolean {
        return !!(this.cache[id]);
    }

    GetFlashData<T>(id: string): T {
        return this._flashMemory[id];
    }
    SetFlashData<T>(id: string, data: T): void {
        this._flashMemory[id] = data;
    }
    RemoveFlashData(id: string): void {
        delete this._flashMemory[id];
    }
}

@profile
export abstract class SwarmMemoryBase<T extends SwarmDataType, U extends SwarmType, V extends SwarmSubType, X extends ISwarmData<T, U, V>>
    extends MemoryBase implements ISwarmData<T, U, V> {
    protected abstract get cache(): X;
    abstract get MEM_TYPE(): T; //{ return this.cache.MEM_TYPE; }
    abstract get SWARM_TYPE(): U; //{ return this.cache.SWARM_TYPE; }
    abstract get SUB_TYPE(): V; //{ return this.cache.SUB_TYPE; }
}
export abstract class SwarmMemoryWithSpecifiedData<T extends SwarmData>
    extends SwarmMemoryBase<SwarmDataType, SwarmType, SwarmSubType, T> implements SwarmData {
    constructor(data: T) {
        super();
        this._cache = data;
    }
    private _cache: T;
    protected get cache() { return this._cache; }
}




/*
declare type SwarmMemory = SwarmMemoryBase<SwarmDataType, SwarmType, SwarmSubType>;
declare type RoomMemory = RoomMemoryBase<RoomType>;
declare type RoomObjectMemory = RoomObjectMemoryBase<SwarmRoomObjectType>;
declare type StructureMemory = StructureMemoryBase<SwarmStructureType, StructureConstant>;
declare type FlagMemory = FlagMemoryBase<FlagType>;
declare type CreepMemory = CreepMemoryBase<CreepType>;
declare type ConsulMemory = ConsulMemoryBase<ConsulType>;*/

@profile
export class MasterMemoryBase<T extends SwarmDataType> extends
    SwarmMemoryBase<SwarmDataType.Master, SwarmType.SwarmMaster, T> implements IMasterData<T> {
    get ChildData(): IMasterData<T> {

    }
}

@profile
export abstract class MasterSwarmMemory extends
    SwarmMemoryBase<SwarmDataType.Master, SwarmType.SwarmMaster, SwarmDataType>
    implements IMasterData<SwarmDataType> {
    get isActive() { return true; }
    get ChildData() {
        return this.cache.ChildData
    }
    GetMemoryIDs() { return Object.keys(this.ChildData); }
    HasMemory(id: string) { return !!this.ChildData[id]; }
    CheckoutMemory(id: string) {
        let data = this.ChildData[id];
        let newMem = SwarmCreator.CreateSwarmMemory(data as IData<T, SwarmSubType>);
        return newMem;
    }
    SaveMemory(childData: MemObject): void {
        this.ChildData[childData.id] = childData.ReleaseMemory() as IData<T, SwarmSubType>;
    }
    DeleteMemory(saveID: string): void {
        if (!!this.ChildData[saveID]) {
            delete this.ChildData[saveID];
        }
    }
}

@profile
export class MasterCreepMemory extends MasterSwarmMemory<SwarmDataType.Creep, IMasterCreepData>
    implements IMasterCreepData {
    get SUB_TYPE(): SwarmDataType.Creep { return SwarmDataType.Creep; }
}
@profile
export class MasterFlagMemory extends MasterSwarmMemory<SwarmDataType.Flag, IMasterFlagData> implements IMasterFlagData {
    get SUB_TYPE(): SwarmDataType.Flag { return SwarmDataType.Flag; }
}
@profile
export class MasterRoomMemory extends MasterSwarmMemory<SwarmDataType.Room, IMasterRoomData> implements IMasterRoomData {
    get SUB_TYPE(): SwarmDataType.Room { return SwarmDataType.Room; }
}
@profile
export class MasterStructureMemory extends MasterSwarmMemory<SwarmDataType.Structure, IMasterStructureData>
    implements IMasterStructureData {
    get SUB_TYPE(): SwarmDataType.Structure { return SwarmDataType.Structure; }
}
@profile
export class MasterRoomObjectMemory extends MasterSwarmMemory<SwarmDataType.RoomObject, IMasterRoomObjectData>
    implements IMasterRoomObjectData {
    get SUB_TYPE(): SwarmDataType.RoomObject { return SwarmDataType.RoomObject; }
}
@profile
export class MasterConsulMemory extends MasterSwarmMemory<SwarmDataType.Consul, IMasterConsulData>
    implements IMasterConsulData {
    get SUB_TYPE(): SwarmDataType.Consul { return SwarmDataType.Consul; }

}