import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";

export abstract class MemoryBase<U extends SwarmDataType, T extends SwarmDataTypes> implements IMemory<T, U> {
    constructor(data: T) {
        this._cache = data;
    }
    get isActive() { return this._cache.isActive; }
    get id() { return this._cache.id; }
    get IsCheckedOut() { return this._checkedOut }
    get MEM_TYPE() { return this._cache.MEM_TYPE as U; }
    get SWARM_TYPE() { return this._cache.SWARM_TYPE; }

    protected _cache!: T;
    private _checkedOut!: boolean;

    GetDataIDs() { return Object.keys(this._cache); }
    HasData(id: string): boolean {
        return !!(this._cache[id]);
    }
    GetData<Z>(id: string): Z {
        return this._cache[id];
    }
    SetData<Z>(id: string, data: Z): void {
        this._cache[id] = data;
    }
    RemoveData(id: string): void {
        delete this._cache[id];
    }
    ReserveMemory() {
        if (this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory already checked out");
        }

        this._checkedOut = true;
    }

    ReleaseData(): T {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory not checked out");
        }

        this._checkedOut = false;
        return CopyObject(this._cache);
    }
}

@profile
export class BasicMemory extends MemoryBase<SwarmDataType.Other, IOtherData> implements IOtherMemory, IOtherData {
}
@profile
export abstract class SwarmMemory<T extends SwarmDataType, U extends SwarmType, V extends SwarmDataTypes>
    extends MemoryBase<T, V> implements ISwarmData<T, U> {
    [id: string]: any;
    get SWARM_TYPE() { return this._cache.SWARM_TYPE as U; }
}

@profile
export class FlagMemory extends SwarmMemory<SwarmDataType.Flag, SwarmType.SwarmFlag, IFlagData>
    implements IFlagMemory {
    get FLG_TYPE(): number { return this._cache.FLG_TYPE; }
}

@profile
export class StructureMemory<T extends SwarmStructureType, U extends TStructureData>
    extends SwarmMemory<SwarmDataType.Structure, T, U>
    implements IStructureMemory<U> {

}

@profile
export class CreepMemory extends SwarmMemory<SwarmDataType.Creep, SwarmType.SwarmCreep, ICreepData>
    implements ICreepMemory, ICreepData {
    get CREEP_TYPE(): number { return this._cache.CREEP_TYPE; }
}

@profile
export class RoomMemory extends SwarmMemory<SwarmDataType.Room, SwarmType.SwarmRoom, IRoomData>
    implements IRoomMemory, IRoomData {
    get RM_TYPE() { return this._cache.RM_TYPE; }
    get LastUpdated() { return this._cache.LastUpdated; }
}

@profile
export class RoomObjectMemory<T extends SwarmRoomObjectType, U extends TRoomObjectData>
    extends SwarmMemory<SwarmDataType.RoomObject, T, U>
    implements IRoomObjectMemory<U> {

}

export class MasterSwarmMemory<T extends MasterSwarmDataTypes, U extends SwarmMemoryTypes>
    extends MemoryBase<SwarmDataType.Master, T> implements IMasterMemory<T, U> {
    constructor(data: T) {
        super(data);
        this.ChildData = this.GetData("ChildData");
    }
    protected ChildData!: { [id: string]: TBasicSwarmData; }
    CheckoutMemory(id: string): U {
        let data = this.ChildData[id];
        let newMem = SwarmCreator.CreateSwarmMemory(data);

        newMem.ReserveMemory();
        return newMem as U;
        //create memory from the data in ID and return the memory.
    }
    SaveMemory(childData: SwarmMemoryTypes): void {
        this.ChildData[childData.id] = childData.ReleaseMemory();
    }
}


export class MasterCreepMemory extends MasterSwarmMemory<IMasterCreepData, ICreepMemory> implements IMasterCreepMemory {
}
export class MasterFlagMemory extends MasterSwarmMemory<IMasterFlagData, IFlagMemory>
    implements IMasterFlagMemory {

}
export class MasterRoomMemory extends MasterSwarmMemory<IMasterRoomData, IRoomMemory>
    implements IMasterRoomMemory {

}
export class MasterStructureMemory extends MasterSwarmMemory<IMasterStructureData, TStructureMemory>
    implements IMasterStructureMemory {

}
export class MasterRoomObjectMemory extends MasterSwarmMemory<IMasterRoomObjectData, TRoomObjectMemory>
    implements IMasterRoomObjectMemory {

}

export class MasterOtherMemory extends MasterSwarmMemory<IMasterOtherData, IOtherMemory>
    implements IMasterOtherMemory {

}