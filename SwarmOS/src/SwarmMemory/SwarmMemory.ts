import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException, NotImplementedException } from "Tools/SwarmExceptions";
import { SwarmMemoryTypes, SwarmStructureTypes } from "SwarmTypes/SwarmCreator";

declare type SwarmData<T extends SwarmDataTypeSansMaster> = ISwarmData<T, SwarmType, string | number>;
@profile
export abstract class MemoryBase<T extends SwarmDataType, U extends IData<T, string | number>> implements IData<T, string | number> {
    constructor(data: U) {
        this._cache = data;
        this._checkedOut = true;
    }
    private _checkedOut: boolean;
    private _cache: U;
    protected get cache() { return this._cache; }

    get id() { return this.cache.id; }
    get IsCheckedOut() { return this._checkedOut }
    abstract get isActive(): boolean;

    abstract get MEM_TYPE(): T
    abstract get SUB_TYPE(): string | number;
    //protected abstract SetCache(data: IData<SwarmDataType, string | number>): void;

    GetDataIDs() { return Object.keys(this.cache); }
    HasData(id: string): boolean {
        return !!(this.cache[id]);
    }
    GetData<Z>(id: string): Z {
        return this.cache[id];
    }
    SetData<Z>(id: string, data: Z): void {
        this.cache[id] = data;
    }
    DeleteMemory(id: string): void {
        delete this.cache[id];
    }

    ReleaseData() {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory not checked out");
        }

        this._checkedOut = false;
        return CopyObject(this.cache)
    }
}

@profile
export abstract class SwarmMemory<T extends SwarmDataTypeSansMaster, U extends SwarmType,
    V extends number | string, X extends SwarmData<T>> extends MemoryBase<T, X> {
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
    abstract get SUB_TYPE(): V;
}

@profile
export class FlagMemory<T extends FlagType>
    extends SwarmMemory<SwarmDataType.Flag, SwarmType.SwarmFlag, FlagType, TFlagData> implements TFlagData {
    get SWARM_TYPE(): SwarmType.SwarmFlag { return SwarmType.SwarmFlag; }
    get SUB_TYPE(): FlagType { return FlagType.None; }
}


@profile
export class CreepMemory<T extends CreepType>
    extends SwarmMemory<SwarmDataType.Creep, SwarmType.SwarmCreep, CreepType, TCreepData> implements TCreepData {
    get SWARM_TYPE(): SwarmType.SwarmCreep { return SwarmType.SwarmCreep; }
    get SUB_TYPE(): CreepType { return CreepType.None; }
}

@profile
export class RoomMemory<T extends RoomType>
    extends SwarmMemory<SwarmDataType.Room, SwarmType.SwarmRoom, RoomType, TRoomData> implements TRoomData {
    get SWARM_TYPE(): SwarmType.SwarmRoom { return SwarmType.SwarmRoom; }
    get SUB_TYPE(): RoomType { return RoomType.NeutralRoom; }
}

@profile
export abstract class MasterSwarmMemory<T extends SwarmDataTypeSansMaster, U extends SwarmType,
    V extends ISwarmData<T, U, number | string>, X extends IMasterData<T>> extends MemoryBase<SwarmDataType.Master, X> {
    constructor(data: X) {
        super(data);
        this.ChildData = this.GetData("ChildData");
    }
    get MEM_TYPE(): SwarmDataType.Master { return SwarmDataType.Master }
    get isActive() { return true; }
    abstract get SUB_TYPE(): T;
    ChildData!: { [id: string]: V; }
    GetDataIDs() { return Object.keys(this.ChildData); }
    HasData(id: string) { return !!this.ChildData[id]; }
    CheckoutMemory(id: string) {
        let data = this.ChildData[id];
        let newMem = SwarmCreator.CreateSwarmMemory(data);

        newMem.ReserveMemory();
        return newMem;
    }
    SaveMemory(childData: MemoryBase<T, V>): void {
        this.ChildData[childData.id] = childData.ReleaseData();
    }
    DeleteMemory(saveID: string): void {
        if (!!this.ChildData[saveID]) {
            delete this.ChildData[saveID];
        }
    }
}

@profile
export class MasterCreepMemory extends MasterSwarmMemory<SwarmDataType.Creep, SwarmType.SwarmCreep,
TCreepData, IMasterCreepData> implements IMasterCreepData {
    get SUB_TYPE(): SwarmDataType.Creep { return SwarmDataType.Creep; }
}
@profile
export class MasterFlagMemory extends MasterSwarmMemory<SwarmDataType.Flag, SwarmType.SwarmFlag,
TFlagData, IMasterFlagData> implements IMasterFlagData {
    get SUB_TYPE(): SwarmDataType.Flag { return SwarmDataType.Flag; }
}
@profile
export class MasterRoomMemory extends MasterSwarmMemory<SwarmDataType.Room, SwarmType.SwarmRoom, TRoomData,
IMasterRoomData> implements IMasterRoomData {
    get SUB_TYPE(): SwarmDataType.Room { return SwarmDataType.Room; }
}
@profile
export class MasterStructureMemory extends MasterSwarmMemory<SwarmDataType.Structure, SwarmStructureType,
TStructureData, IMasterStructureData> implements IMasterStructureData {
    get SUB_TYPE(): SwarmDataType.Structure { return SwarmDataType.Structure; }
}
@profile
export class MasterRoomObjectMemory extends MasterSwarmMemory<SwarmDataType.RoomObject, SwarmRoomObjectType,
TRoomObjectData, IMasterRoomObjectData> implements IMasterRoomObjectData {
    get SUB_TYPE(): SwarmDataType.RoomObject { return SwarmDataType.RoomObject; }
}
@profile
export class MasterConsulMemory extends MasterSwarmMemory<SwarmDataType.Consul, SwarmType.SwarmConsul,
TConsulData, IMasterConsulData> implements IMasterConsulData {
    get SUB_TYPE(): SwarmDataType.Consul { return SwarmDataType.Consul; }

}