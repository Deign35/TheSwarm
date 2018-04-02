import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";

/*export abstract class MemBase {
    constructor(data: Dictionary) {
        this._cache = data;
    }
    private _checkedOut!: boolean;
    protected _cache!: Dictionary;
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

    ReleaseData() {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory not checked out");
        }

        this._checkedOut = false;
        return CopyObject(this._cache);
    }
}*/

export abstract class MemoryBase<T extends SwarmDataType> implements IData<T> {
    constructor(data: IData<T>) {
        this._cache = data;
    }
    get isActive() { return this._cache.isActive; }
    get id() { return this._cache.id; }
    get IsCheckedOut() { return this._checkedOut }
    get MEM_TYPE() { return this._cache.MEM_TYPE as T; }
    get SWARM_TYPE() { return this._cache.SWARM_TYPE; }

    protected _cache!: IData<T>;
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

    ReleaseData(): IData<T> {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory not checked out");
        }

        this._checkedOut = false;
        return CopyObject(this._cache);
    }
}

@profile
export class BasicMemory extends MemoryBase<SwarmDataType.Other> implements IOtherData {
}
@profile
export abstract class SwarmMemory<T extends SwarmDataType, U extends SwarmType>
    extends MemoryBase<T> implements ISwarmData<T, U> {
    [id: string]: any;
    get SWARM_TYPE() { return this._cache.SWARM_TYPE as U; }
    get SUB_TYPE() { return this._cache.SUB_TYPE; }
}

@profile
export class FlagMemory extends SwarmMemory<SwarmDataType.Flag, SwarmType.SwarmFlag>
    implements IFlagData {
}

@profile
export class StructureMemory<T extends SwarmStructureType>
    extends SwarmMemory<SwarmDataType.Structure, T>
    implements IStructureData<T> {

}

@profile
export class CreepMemory extends SwarmMemory<SwarmDataType.Creep, SwarmType.SwarmCreep>
    implements ICreepData {
}

@profile
export class RoomMemory extends SwarmMemory<SwarmDataType.Room, SwarmType.SwarmRoom>
    implements IRoomData {
}

@profile
export class RoomObjectMemory<T extends SwarmRoomObjectType>
    extends SwarmMemory<SwarmDataType.RoomObject, T>
    implements IRoomObjectData<T> {

}

export class MasterSwarmMemory<T extends IMasterData<U>, U extends SwarmDataType>
    extends MemoryBase<SwarmDataType.Master> implements IMasterData<U> {
    constructor(data: T) {
        super(data);
        this.ChildData = this.GetData("ChildData");
    }
    ChildData!: { [id: string]: IData<U>; }
    GetDataIDs() { return Object.keys(this.ChildData); }
    HasData(id: string) { return !!this.ChildData[id] }
    CheckoutMemory(id: string): IData<U> {
        let data = this.ChildData[id];
        let newMem = SwarmCreator.CreateSwarmMemory(data);

        newMem.ReserveMemory();
        return newMem as MemoryBase<U>;
        //create memory from the data in ID and return the memory.
    }
    SaveMemory(childData: MemoryBase<U>): void {
        this.ChildData[childData.id] = childData.ReleaseData();
    }
    RemoveData(saveID: string): void {
        if (!!this.ChildData[saveID]) {
            delete this.ChildData[saveID];
        }
    }
}


export class MasterCreepMemory extends MasterSwarmMemory<IMasterCreepData, SwarmDataType.Creep>
    implements IMasterCreepData {
}
export class MasterFlagMemory extends MasterSwarmMemory<IMasterFlagData, SwarmDataType.Flag>
    implements IMasterFlagData {

}
export class MasterRoomMemory extends MasterSwarmMemory<IMasterRoomData, SwarmDataType.Room>
    implements IMasterRoomData {

}
export class MasterStructureMemory extends MasterSwarmMemory<IMasterStructureData, SwarmDataType.Structure>
    implements IMasterStructureData {

}
export class MasterRoomObjectMemory extends MasterSwarmMemory<IMasterRoomObjectData, SwarmDataType.RoomObject>
    implements IMasterRoomObjectData {

}

export class MasterOtherMemory extends MasterSwarmMemory<IMasterOtherData, SwarmDataType.Other>
    implements IMasterOtherData {

}