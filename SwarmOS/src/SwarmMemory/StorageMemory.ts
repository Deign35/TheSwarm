import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";

export abstract class MemoryBase<T extends SwarmDataType, U extends IData<T>> implements IMemory<U, T>, IData<T> {
    constructor(data: U) {
        this._cache = data;
    }
    get isActive() { return this._cache.isActive; }
    get id() { return this._cache.id; }
    get IsCheckedOut() { return this._checkedOut }
    get MEM_TYPE(): T { return this._cache.MEM_TYPE; }

    protected _cache!: U;
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

    ReleaseMemory(): U {
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
export abstract class SwarmMemory<T extends SwarmDataType, U extends SwarmType, V extends ISwarmData<T, U>>
    extends MemoryBase<T, V> implements ISwarmData<T, U> {
    get SWARM_TYPE(): U { return this._cache.SWARM_TYPE; }
}

@profile
export class FlagMemory extends SwarmMemory<SwarmDataType.Flag, SwarmType.SwarmFlag, IFlagData>
    implements IFlagMemory, IFlagData {
    get FLG_TYPE(): number { return this._cache.FLG_TYPE; }
}

@profile
export class StructureMemory<T extends SwarmStructureType>
    extends SwarmMemory<SwarmDataType.Structure, T, IStructureData<T>>
    implements IStructureMemory<T>, IStructureData<T> {

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
}

@profile
export class RoomObjectMemory<T extends SwarmRoomObjectType>
    extends SwarmMemory<SwarmDataType.RoomObject, T, IRoomObjectData<T>>
    implements IRoomObjectMemory<T>, IRoomObjectData<T> {

}

export class MasterSwarmMemory<T extends MasterSwarmDataTypes>
    extends MemoryBase<SwarmDataType.Master, T> implements IMasterMemory<T> {
    constructor(data: T) {
        super(data);
        this.ChildData = this.GetData("ChildData");
    }
    protected ChildData!: { [id: string]: IData<SwarmDataType>; }
    CheckoutMemory(id: string): SwarmMemoryTypes {
        let data = this.ChildData[id];
        let newMem = SwarmCreator.CreateSwarmMemory(data);

        newMem.ReserveMemory();
        return newMem;
        //create memory from the data in ID and return the memory.
    }
    SaveMemory(childData: SwarmMemoryTypes): void {
        this.ChildData[childData.id] = childData.ReleaseMemory();
    }
}


export class MasterCreepMemory extends MasterSwarmMemory<IMasterCreepData> implements IMasterCreepMemory {
}
export class MasterFlagMemory extends MasterSwarmMemory<IMasterFlagData>
    implements IMasterFlagMemory {

}
export class MasterRoomMemory extends MasterSwarmMemory<IMasterRoomData>
    implements IMasterRoomMemory {

}
export class MasterStructureMemory extends MasterSwarmMemory<IMasterStructureData>
    implements IMasterStructureMemory {

}
export class MasterRoomObjectMemory extends MasterSwarmMemory<IMasterRoomObjectData>
    implements IMasterRoomObjectMemory {

}

export class MasterOtherMemory extends MasterSwarmMemory<IMasterOtherData>
    implements IMasterOtherMemory {

}