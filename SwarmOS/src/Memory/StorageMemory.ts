import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";

@profile
export abstract class StorageMemory<T extends SwarmData> implements IStorageMemory {
    constructor(id: string, path: string[], data?: any) {
        this._id = id;
        this._savePath = path;
        this._cache = data || {};
        this._checkedOut = false;
        if (!this._cache[MEM_TYPE]) {
            this.SetData(MEM_TYPE, this.GetMemoryType());
        }
    }
    get id() { return this._id };
    get IsCheckedOut() { return this._checkedOut };
    get SavePath() { return this._savePath.slice(); }
    get SaveData() { return this._cache; }
    get MemoryType(): StorageMemoryType { return this._cache[MEM_TYPE] as StorageMemoryType }

    private readonly _savePath: string[];
    private _id: string;
    protected _cache: T;
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
    /**
     * @throws MemoryLockException
     */
    SaveTo(parentObj: IStorageMemory) {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory not checked out");
        }

        parentObj.SetData(this._id, this._cache);
        this._checkedOut = false;
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

    CreateChildMemory(id: string, memType: StorageMemoryType, data?: any) {
        if (this._cache[id]) {
            throw new AlreadyExistsException("Child memory already exists: " + this.SavePath + " -- " + id);
        }

        let childPath = this.SavePath;
        childPath.push(this.id);
        Swarmlord.CreateNewStorageMemory(id, childPath, memType, data);
    }
}

@profile
export class BasicMemory extends StorageMemory<EmptyData> {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.None;
    }
}

@profile
export class ConsulMemory extends StorageMemory<ConsulData> {
    get SavePath() {

        return super.SavePath;
    }
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Consul;
    }
}

@profile
export class FlagMemory extends StorageMemory<FlagData> {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Flag;
    }
}

@profile
export class StructureMemory extends StorageMemory<StructureData> {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Structure;
    }
}

@profile
export class CreepMemory extends StorageMemory<CreepData> {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Creep;
    }
}

@profile
export class RoomMemory extends StorageMemory<RoomData> {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Room;
    }
}