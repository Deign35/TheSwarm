import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";

@profile
export abstract class StorageMemory<T extends StorageMemoryTypes> implements IStorageMemory<T> {
    constructor(id: string, data?: T) {
        this._id = id;
        if (data) {
            this._cache = data;
        } else {
            this._cache = this.CreateEmptyMemory();
            this.SetData(MEM_TYPE, this.GetMemoryType());
        }
        this._checkedOut = false;
    }
    get id() { return this._id };
    get IsCheckedOut() { return this._checkedOut };
    get MemoryType(): StorageMemoryType { return this._cache[MEM_TYPE] as StorageMemoryType }

    private _id: string;
    protected _cache: T;
    private _checkedOut: boolean;

    protected abstract GetMemoryType(): StorageMemoryType;
    protected abstract CreateEmptyMemory(): T;

    GetIDs() { return Object.getOwnPropertyNames(this._cache); }
    GetSaveData(): T { return CopyObject(this._cache); }

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

    SaveChildMemory(childMemory: IStorageMemory<StorageMemoryTypes>) {
        childMemory.ReleaseMemory();
        this.SetData(childMemory.id, childMemory.GetSaveData());
    }
}

@profile
export class BasicMemory extends StorageMemory<Dictionary> {
    protected GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Other;
    }
    protected CreateEmptyMemory() {
        return {} as Dictionary;
    }
}

@profile
export class FlagMemory extends StorageMemory<FlagData> {
    protected GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Flag;
    }
    protected CreateEmptyMemory() {
        return {} as FlagData;
    }
}

@profile
export class StructureMemory extends StorageMemory<StructureData> {
    protected GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Structure;
    }
    protected CreateEmptyMemory() {
        return {} as StructureData;
    }
}

@profile
export class CreepMemory extends StorageMemory<CreepData> {
    protected GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Creep;
    }
    protected CreateEmptyMemory() {
        return {} as CreepData;
    }
}

@profile
export class RoomMemory extends StorageMemory<RoomData> {
    protected GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Room;
    }
    protected CreateEmptyMemory(): RoomData {
        return {
            queenType: QueenType.Larva,
            OBJs: {}
        } as RoomData;
    }
}

@profile
export class RoomObjectMemory extends StorageMemory<RoomObjectData> {
    protected GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.RoomObject;
    }
    protected CreateEmptyMemory(): RoomObjectData {
        return {} as RoomObjectData
    }
}