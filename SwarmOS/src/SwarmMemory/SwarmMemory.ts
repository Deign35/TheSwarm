import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException, NotImplementedException } from "Tools/SwarmExceptions";

@profile
export abstract class MemoryBase<T extends SwarmDataType, U extends string | number,
    V extends IData<T, U>> implements IData<T, U> {
    constructor(data: V) {
        this._cache = data;
        this._checkedOut = false;
        this._flashMemory = {};
    }

    private _cache: V;
    private _checkedOut: boolean;
    private _flashMemory: Dictionary;
    protected get cache() { return this._cache; }

    get id() { return this.cache.id; }
    get IsCheckedOut() { return this._checkedOut }
    abstract get isActive(): boolean;

    abstract MEM_TYPE: T
    abstract SUB_TYPE: U;
    //protected abstract SetCache(data: IData<SwarmDataType, string | number>): void;

    GetMemoryIDs() { return Object.keys(this.cache); }
    HasMemory(id: string): boolean {
        return !!(this.cache[id]);
    }
    GetFlashData<Z>(id: string): Z {
        return this._flashMemory[id];
    }
    SetFlashData<Z>(id: string, data: Z): void {
        this._flashMemory[id] = data;
    }
    RemoveFlashData(id: string): void {
        delete this._flashMemory[id];
    }

    ReserveMemory() {
        if (this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory already checked out");
        }
        this._checkedOut = true;
    }
    ReleaseMemory() {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory not checked out");
        }

        this._checkedOut = false;
        return CopyObject(this.cache)
    }
}

@profile
export abstract class SwarmMemory<T extends SwarmDataTypeSansMaster, U extends SwarmType,
    V extends number | string> extends MemoryBase<T, V, ISwarmData<T, U, V>> {
    get isActive(): boolean {
        return this.cache.isActive;
    }
    get MEM_TYPE(): T {
        switch (this.SWARM_TYPE) {
            case (SwarmType.None):
                throw new NotImplementedException('Object has SwarmType.None.');
            case (SwarmType.SwarmCreep):
                return SwarmDataType.Creep as T;
            case (SwarmType.SwarmRoom):
                return SwarmDataType.Room as T;
            case (SwarmType.SwarmFlag):
                return SwarmDataType.Flag as T;
            case (SwarmType.SwarmConsul):
                return SwarmDataType.Consul as T;
            case (SwarmType.SwarmMineral):
            case (SwarmType.SwarmNuke):
            case (SwarmType.SwarmResource):
            case (SwarmType.SwarmSite):
            case (SwarmType.SwarmSource):
            case (SwarmType.SwarmTombstone):
                return SwarmDataType.RoomObject as T;
            default:
                return SwarmDataType.Structure as T;
        }
    }
    abstract get SWARM_TYPE(): U;
    get SUB_TYPE(): V { return this.cache.SUB_TYPE as V; }
    set SUB_TYPE(subType: V) {
        this.cache.SUB_TYPE = subType;
    }
}

@profile
export class FlagMemory<T extends FlagType>
    extends SwarmMemory<SwarmDataType.Flag, SwarmType.SwarmFlag, FlagType> implements TFlagData {
    get SWARM_TYPE(): SwarmType.SwarmFlag { return SwarmType.SwarmFlag; }
}


@profile
export class CreepMemory<T extends CreepType, U extends ICreepData<T>>
    extends SwarmMemory<SwarmDataType.Creep, SwarmType.SwarmCreep, T> implements TCreepData {
    get SWARM_TYPE(): SwarmType.SwarmCreep { return SwarmType.SwarmCreep; }
}

@profile
export class RoomMemory<T extends RoomType, U extends IRoomData<T>>
    extends SwarmMemory<SwarmDataType.Room, SwarmType.SwarmRoom, T> implements TRoomData {
    get SWARM_TYPE(): SwarmType.SwarmRoom { return SwarmType.SwarmRoom; }
}

@profile
export abstract class MasterSwarmMemory<T extends SwarmDataTypeSansMaster, U extends IMasterData<T>>
    extends MemoryBase<SwarmDataType.Master, T, U> {
    get MEM_TYPE(): SwarmDataType.Master { return SwarmDataType.Master }
    get isActive() { return true; }
    get ChildData() {
        return this.cache.ChildData
    }
    GetMemoryIDs() { return Object.keys(this.ChildData); }
    HasMemory(id: string) { return !!this.ChildData[id]; }
    CheckoutMemory(id: string) {
        let data = this.ChildData[id];
        let newMem = SwarmCreator.CreateSwarmMemory(data);

        newMem.ReserveMemory();
        return newMem;
    }
    SaveMemory(childData: SwarmMemory<T, SwarmType, string | number>): void {
        this.ChildData[childData.id] = childData.ReleaseMemory();
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