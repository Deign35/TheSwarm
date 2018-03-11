import { profile } from "Tools/Profiler";

@profile
export abstract class StorageMemory implements IStorageMemory {
    constructor(id: string, path: string[], data?: any) {
        this._id = id;
        this._savePath = path;
        this._cache = data || {};
        this._checkedOut = false;
        if (!this._cache[MEM_TYPE]) {
            this._cache[MEM_TYPE] = this.GetMemoryType();
        }
    }
    get IsCheckedOut() { return this._checkedOut };
    get SavePath() { return this._savePath; }
    get SaveData() { return this._cache; }
    get MemoryType(): StorageMemoryType { return this._cache[MEM_TYPE] as StorageMemoryType }

    private readonly _savePath: string[];
    private _id: string;
    private _cache: { [id: string]: any };
    private _checkedOut: boolean;

    protected abstract GetMemoryType(): StorageMemoryType;

    GetData<T>(id: string): T {
        return this._cache[id];
    }
    SetData<T>(id: string, data: T): void {
        this._cache[id] = data;
    }
    RemoveData(id: string): void {
        delete this._cache[id];
    }
    SaveTo(parentObj: IStorageMemory) {
        if (this._checkedOut) {
            parentObj[this._id] = this._cache;
            this._checkedOut = false;
            return C_NONE;
        }

        return E_INVALID;
    }

    CreateChildData(id: string): void {

    }
}

@profile
export class BasicMemory extends StorageMemory {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.None;
    }
}

@profile
export class ConsulMemory extends StorageMemory implements ConsulData {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Consul;
    }
}

@profile
export class FlagMemory extends StorageMemory {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Flag;
    }
}

@profile
export class StructureMemory extends StorageMemory {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Structure;
    }
}

@profile
export class CreepMemory extends StorageMemory {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Creep;
    }
}

@profile
export class RoomMemory extends StorageMemory {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Room;
    }
}