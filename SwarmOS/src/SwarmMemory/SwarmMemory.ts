import { MemoryLockException } from "Tools/SwarmExceptions";

declare type ObjectType = {
    dataType: SwarmDataType,
    swarmType: SwarmType,
    subType: SwarmSubType
}
export class MemoryBase {
    constructor(memoryInit: Dictionary) {
        this._checkedOut = false;
        this._cache = memoryInit;
        this._flashMemory = CopyObject(this._cache);
    }
    protected get cache() {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory must be checked out before access to the cache is allowed");
        }
        return this._flashMemory;
    }
    private _cache: Dictionary;
    private _flashMemory: Dictionary;
    private _checkedOut: boolean;

    get id(): string { return this._flashMemory.id; }
    get isActive(): boolean { return this._flashMemory.isActive; }
    get IsCheckedOut(): boolean { return this._checkedOut }

    get ObjectType(): ObjectType { return this._flashMemory.ObjectType; }

    get MEM_TYPE(): SwarmDataType { return this._flashMemory.MEM_TYPE; }
    get SWARM_TYPE(): SwarmType { return this._flashMemory.SWARM_TYPE; }
    get SUB_TYPE(): SwarmSubType { return this._flashMemory.SUB_TYPE; }

    ReserveData(): void {
        if (this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory already checked out");
        }
        this._checkedOut = true;
    }
    ReleaseData(): Dictionary {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory not checked out");
        }

        this._checkedOut = false;
        return this._cache;
    }

    HasData(valueID: string) {
        return !(this._flashMemory[valueID] === undefined);
    }
    GetData<T>(valueID: string): T {
        return this._flashMemory[valueID];
    }
    SetData<T>(valueID: string, newValue: T, saveToMemory: boolean) {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory must be checked out before you can save to it");
        }
        this._flashMemory[valueID] = newValue;
        if (saveToMemory) {
            this._cache[valueID] = CopyObject(newValue);
        }
    }
    DeleteData(valueID: string, deleteFromMemory: boolean = false) {
        delete this._flashMemory[valueID];
        if (deleteFromMemory) {
            delete this._cache[valueID];
        }
    }
    GetDataIDs(): string[] { return Object.keys(this._flashMemory); }
}

const CHILD_DATA_ID = 'ChildData';
export class ParentMemory extends MemoryBase {
    constructor(data: Dictionary) {
        super(data);
        this._childData = CopyObject(this.GetData(CHILD_DATA_ID))
    }

    private _childData: Dictionary;
    private _childMemory: IDictionary<MemoryBase> = {}

    GetMemoryIDs() { return Object.keys(this._childData); }
    HasMemory(id: string) { return !!this._childData[id] }
    CheckoutChildMemory(id: string) {
        if (!this._childMemory[id]) {
            this._childMemory[id] = new MemoryBase(this._childData[id]);
        }
        let mem = this._childMemory[id]
        mem.ReserveData();
        return mem;
    }

    SaveChildMemory(childMemory: MemoryBase, saveToMemory: boolean): void {
        if (!this._childMemory[childMemory.id]) {
            this._childMemory[childMemory.id] = childMemory;
        }
        this._childData[childMemory.id] = childMemory.ReleaseData();
        if (saveToMemory) {
            this.SetData(CHILD_DATA_ID, this._childData, saveToMemory);
        }
    }

    DeleteChildMemory(id: string, saveToMemory: boolean = true): void {
        if (this._childMemory[id] !== undefined) {
            delete this._childMemory[id];
        }
        if (this._childData[id] !== undefined) {
            delete this._childData[id];
        }
        if (saveToMemory) {
            this.SetData(CHILD_DATA_ID, this._childData, saveToMemory);
        }
    }
}