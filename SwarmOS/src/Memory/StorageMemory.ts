import { profile } from "Tools/Profiler";
import { SwarmException } from "Tools/SwarmExceptions";

const MEM_TYPE = 'MEM_TYPE';
export function ConvertDataToMemory(id: string, path: string[], data: any): StorageMemory {
    let memoryType = data[MEM_TYPE] as StorageMemoryType;
    switch (memoryType) {
        case (StorageMemoryType.Creep): return new CreepMemory(id, path, data);
        case (StorageMemoryType.Consul): return new ConsulMemory(id, path, data);
        case (StorageMemoryType.Flag): return new FlagMemory(id, path, data);
        case (StorageMemoryType.Room): return new RoomMemory(id, path, data);
        case (StorageMemoryType.Structure): return new StructureMemory(id, path, data);
    }

    return new BasicMemory(id, path, data);
}
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
export class BasicMemory extends StorageMemory {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.None;
    }
}

export class ConsulMemory extends StorageMemory implements ConsulData {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Consul;
    }
}
export class FlagMemory extends StorageMemory {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Flag;
    }
}
export class StructureMemory extends StorageMemory {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Structure;
    }
}
export class CreepMemory extends StorageMemory {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Creep;
    }
}
export class RoomMemory extends StorageMemory {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Room;
    }
}