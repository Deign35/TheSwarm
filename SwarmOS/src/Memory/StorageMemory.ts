import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";

@profile
export abstract class StorageMemory<T extends SwarmDataType, U extends ISwarmData<T, any>> implements ISwarmMemory<T, U> {
    constructor(id: string, data?: U) {
        this._id = id;
        if (data) {
            this._cache = data;
        } else {
            this._cache = this.CreateEmptyData();
        }
        this._checkedOut = false;
    }
    get id() { return this._id };
    get IsCheckedOut() { return this._checkedOut };
    get MemoryType(): T { return this._cache[MEM_TYPE] as T }

    private _id: string;
    protected _cache: U
    private _checkedOut: boolean;

    protected abstract CreateEmptyData(): U;

    GetIDs() { return Object.getOwnPropertyNames(this._cache); }
    GetSwarmData(): U { return CopyObject(this._cache) as U; }

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
    /**
     * @throws MemoryLockException
     */
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
    }

    SaveChildMemory<A extends SwarmDataType, B extends ISwarmData<A, any>>(childMemory: ISwarmMemory<A, B>) {
        childMemory.ReleaseMemory();
        this.SetData(childMemory.id, childMemory.GetSwarmData());
    }
}

@profile
export class BasicMemory<T> extends StorageMemory<SwarmDataType.Other, IOtherData<T>> implements IOtherMemory<T> {
    protected CreateEmptyData(): IOtherData<T> {
        return {
            MEM_TYPE: SwarmDataType.Other
        };
    }
}

@profile
export class FlagMemory extends StorageMemory<SwarmDataType.Flag, IFlagData> implements IFlagMemory {
    protected CreateEmptyData(): IFlagData {
        return {
            MEM_TYPE: SwarmDataType.Flag
        };
    }
}

@profile
export class StructureMemory extends StorageMemory<SwarmDataType.Structure, IStructureData> implements IStructureMemory {
    protected CreateEmptyData(): IStructureData {
        return {
            MEM_TYPE: SwarmDataType.Structure
        };
    }
}

@profile
export class CreepMemory extends StorageMemory<SwarmDataType.Creep, ICreepData> implements ICreepMemory {
    protected CreateEmptyData(): ICreepData {
        return {
            MEM_TYPE: SwarmDataType.Creep
        };
    }
}

@profile
export class RoomMemory extends StorageMemory<SwarmDataType.Room, IRoomData> {
    protected CreateEmptyData(): IRoomData {
        return {
            OBJs: {
                MEM_TYPE: SwarmDataType.Other
            },
            queenType: 0,
            MEM_TYPE: SwarmDataType.Room
        };
    }
}

@profile
export class RoomObjectMemory extends StorageMemory<SwarmDataType.RoomObject, IRoomObjectData> implements IRoomObjectMemory {
    protected CreateEmptyData(): IRoomObjectData {
        return {
            MEM_TYPE: SwarmDataType.RoomObject
        };
    }
}