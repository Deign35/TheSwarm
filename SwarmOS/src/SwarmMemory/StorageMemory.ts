import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";

export abstract class MemoryBase<T extends SwarmDataType, U extends IData<T>> implements IMemory<U, T>, IData<T> {
    constructor(data: U) {
        this._cache = data;
    }
    get id() { return this._cache.id; }
    get IsCheckedOut() { return this._checkedOut }
    get MEM_TYPE(): T { return this._cache.MEM_TYPE; }

    private _cache!: U;
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
export class BasicMemory extends MemoryBase<SwarmDataType.Other, IOtherData> implements IOtherMemory {

}
@profile
export abstract class SwarmMemory<T extends SwarmDataType, U extends SwarmType, V extends ISwarmData<T, U>>
    extends MemoryBase<T, V> { }

@profile
export class FlagMemory extends SwarmMemory<SwarmDataType.Flag, SwarmType.SwarmFlag, IFlagData>
    implements IFlagMemory { }

@profile
export class StructureMemory<T extends TStructureData>
    extends SwarmMemory<SwarmDataType.Structure, SwarmStructureType, T>
    implements IStructureMemory { }

@profile
export class CreepMemory extends SwarmMemory<SwarmDataType.Creep, SwarmType.SwarmCreep, ICreepData>
    implements ICreepMemory { }

@profile
export class RoomMemory extends SwarmMemory<SwarmDataType.Room, SwarmType.SwarmRoom, IRoomData>
    implements IRoomMemory { }

@profile
export class RoomObjectMemory<T extends TRoomObjectData>
    extends SwarmMemory<SwarmDataType.RoomObject, SwarmRoomObjectType, T> implements IRoomObjectMemory {

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
    SaveMemory(childData: U): void {
        this.ChildData[childData.id] = childData.ReleaseMemory();
    }
}


export class MasterCreepMemory extends MasterSwarmMemory<IMasterCreepData, ICreepMemory>
    implements IMasterCreepMemory {

}
export class MasterFlagMemory extends MasterSwarmMemory<IMasterFlagData, IFlagMemory>
    implements IMasterFlagMemory {

}
export class MasterRoomMemory extends MasterSwarmMemory<IMasterRoomData, IRoomMemory>
    implements IMasterRoomMemory {

}
export class MasterStructureMemory extends MasterSwarmMemory<IMasterStructureData, IStructureMemory>
    implements IMasterStructureMemory {

}
export class MasterRoomObjectMemory extends MasterSwarmMemory<IMasterRoomObjectData, IRoomObjectMemory>
    implements IMasterRoomObjectMemory {

}

export class MasterOtherMemory extends MasterSwarmMemory<IMasterOtherData, IOtherMemory>
    implements IMasterOtherMemory {

}