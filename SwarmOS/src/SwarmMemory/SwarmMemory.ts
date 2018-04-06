import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";

@profile
export abstract class MemoryBase<T extends SwarmDataTypes> {
    constructor(data: T) {
        this._cache = data;
    }
    get isActive() { return this._cache.isActive; }
    get id() { return this._cache.id; }
    get IsCheckedOut() { return this._checkedOut }
    //get MEM_TYPE() { return this._cache.MEM_TYPE; }
    //get SWARM_TYPE() { return this._cache.SWARM_TYPE; }

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
export class BasicMemory extends MemoryBase<IOtherData> implements IOtherData {
    get MEM_TYPE(): SwarmDataType.Other { return SwarmDataType.Other; }
    get SWARM_TYPE() { return 0; }
    get SUB_TYPE(): number { return 0 }
}

@profile
export abstract class SwarmMemory<T extends SwarmDataTypes, U extends SwarmType>
    extends MemoryBase<T> {
    [id: string]: any;
    get SWARM_TYPE() { return this._cache.SWARM_TYPE as U; }
    get SUB_TYPE() { return this._cache.SUB_TYPE; }
    get MEM_TYPE() { return this._cache.MEM_TYPE }
}

@profile
export class FlagMemory extends SwarmMemory<IFlagData, SwarmType.SwarmFlag> implements IFlagData {
    get MEM_TYPE(): SwarmDataType.Flag { return SwarmDataType.Flag }
}


@profile
export class CreepMemory extends SwarmMemory<ICreepData, SwarmType.SwarmCreep>
    implements ICreepData {
    get MEM_TYPE(): SwarmDataType.Creep { return SwarmDataType.Creep }
}

@profile
export class RoomMemory extends SwarmMemory<IRoomData, SwarmType.SwarmRoom>
    implements IRoomData {
    get MEM_TYPE(): SwarmDataType.Room { return SwarmDataType.Room }
}

@profile
export class MasterSwarmMemory<T extends MasterSwarmDataTypes, U extends TBasicData>
    extends MemoryBase<T> implements IMasterData<U> {
    constructor(data: T) {
        super(data);
        this.ChildData = this.GetData("ChildData");
    }
    get SWARM_TYPE() { return 0; }
    get MEM_TYPE(): SwarmDataType.Master { return SwarmDataType.Master }
    ChildData!: { [id: string]: U; }
    GetDataIDs() { return Object.keys(this.ChildData); }
    HasData(id: string) { return !!this.ChildData[id] }
    CheckoutMemory(id: string) {
        let data = this.ChildData[id];
        let newMem = SwarmCreator.CreateSwarmMemory(data);

        newMem.ReserveMemory();
        return newMem;
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

@profile
export class MasterCreepMemory extends MasterSwarmMemory<IMasterCreepData, ICreepData>
    implements IMasterCreepData {
}
@profile
export class MasterFlagMemory extends MasterSwarmMemory<IMasterFlagData, IFlagData>
    implements IMasterFlagData {
}
@profile
export class MasterRoomMemory extends MasterSwarmMemory<IMasterRoomData, IRoomData>
    implements IMasterRoomData {
}
@profile
export class MasterStructureMemory extends MasterSwarmMemory<IMasterStructureData, TStructureData>
    implements IMasterStructureData {
}
@profile
export class MasterRoomObjectMemory extends MasterSwarmMemory<IMasterRoomObjectData, TRoomObjectData>
    implements IMasterRoomObjectData {
}
@profile
export class MasterConsulMemory extends MasterSwarmMemory<IMasterConsulData, TConsulData>
    implements IMasterConsulData {

}

@profile
export class MasterOtherMemory extends MasterSwarmMemory<IMasterOtherData, IOtherData>
    implements IMasterOtherData {

}