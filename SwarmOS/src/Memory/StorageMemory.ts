import { profile } from "Tools/Profiler";
import { SwarmException, MemoryLockException, AlreadyExistsException } from "Tools/SwarmExceptions";

@profile
export abstract class StorageMemory<T extends StorageMemoryTypes> implements IStorageMemory<T> {
    constructor(id: string, path: string[], data?: T) {
        this._id = id;
        this._savePath = path;
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

    private readonly _savePath: string[];
    private _id: string;
    protected _cache: T;
    private _checkedOut: boolean;

    protected abstract GetMemoryType(): StorageMemoryType;
    protected abstract CreateEmptyMemory(): T;

    GetSaveData(): T { return CopyObject(this._cache); }
    GetSavePath() { return this._savePath.slice(); }
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
    SaveTo(parentObj: SwarmData | StorageMemoryStructure, keepReserved: boolean = false) {
        this.ReleaseMemory(); // Check back in

        parentObj[this._id] = this.GetSaveData();
        if (keepReserved) {
            this.ReserveMemory(); // Check out if caller wants to keep it.
        }
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

    TryAttachChildMemory<T>(id: string, childMemory: StorageMemory<T>) {
        if (!this._cache[id]) {
            this.AttachChildMemory(id, childMemory);
        }
    }

    private AttachChildMemory<T>(id: string, childMemory: StorageMemory<T>) {
        if (this._cache[id]) {
            throw new AlreadyExistsException("Child memory already exists: " + this._savePath + " -- " + id);
        }

        let childPath = this.GetSavePath();
        childPath.push(this.id);
        this.SetData(id, childMemory.GetSaveData());
    }
}

@profile
export class BasicMemory extends StorageMemory<EmptyDictionary> {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.None;
    }
    CreateEmptyMemory() {
        return {} as EmptyDictionary;
    }
}

@profile
export class CreepSuitMemory extends StorageMemory<CreepSuitData> {
    /*get SavePath() {
        return super.SavePath;
    }*/
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.CreepSuitData;
    }
    CreateEmptyMemory() {
        return {} as CreepSuitData;
    }
}

@profile
export class FlagMemory extends StorageMemory<FlagData> {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Flag;
    }
    CreateEmptyMemory() {
        return {} as FlagData;
    }
}

@profile
export class StructureMemory extends StorageMemory<StructureData> {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Structure;
    }
    CreateEmptyMemory() {
        return {} as StructureData;
    }
}

@profile
export class CreepMemory extends StorageMemory<CreepData> {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Creep;
    }
    CreateEmptyMemory() {
        return {
            suitData: []
        } as CreepData;
    }
}

@profile
export class RoomMemory extends StorageMemory<RoomData> {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.Room;
    }
    CreateEmptyMemory(): RoomData {
        return {
            queenType: QueenType.Larva,
            harvestData: []
        };
    }
}

@profile
export class JobMemory extends StorageMemory<JobData> {
    GetMemoryType(): StorageMemoryType {
        return StorageMemoryType.JobData;
    }
    CreateEmptyMemory() {
        return {} as JobData;
    }
}