import { MemoryLockException } from "Tools/SwarmExceptions";

declare type DataCache = Dictionary;
export class MemoryBase<T extends IData> {
    constructor(fromMemory: T) {
        this._checkedOut = false;
        this._cache = fromMemory;
        this._flashMemory = CopyObject(this._cache);
    }
    protected get cache() {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory must be checked out before access to the cache is allowed");
        }
        return this._flashMemory;
    }
    private _cache: T;
    private _flashMemory: T;
    private _checkedOut: boolean;

    get id(): string { return this.cache.id; }
    get isActive(): boolean { return this.cache.isActive; }
    get IsCheckedOut(): boolean { return this._checkedOut }
    get MEM_TYPE(): SwarmDataType { return this.cache.MEM_TYPE; }
    get SWARM_TYPE(): SwarmType { return this.cache.SWARM_TYPE; }
    get SUB_TYPE(): SwarmSubType { return this.cache.SUB_TYPE; }

    ReserveMemory(): void {
        if (this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory already checked out");
        }
        this._checkedOut = true;
    }
    ReleaseMemory(): IData {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory not checked out");
        }

        this._checkedOut = false;
        return this._cache;
    }

    HasData(valueID: string) {
        return !!this._flashMemory[valueID];
    }
    GetData<T>(valueID: string): T {
        return this._flashMemory[valueID];
    }
    SetData<T>(valueID: string, newValue: T, saveToMemory: boolean) {
        this._flashMemory[valueID] = newValue;
        if (saveToMemory) {
            this._cache[valueID] = newValue;
        }
    }
    DeleteData(valueID: string, deleteFromMemory: boolean = false) {
        delete this._flashMemory[valueID];
        if (deleteFromMemory) {
            delete this._cache[valueID];
        }
    }
    GetMemoryIDs(): string[] { return Object.keys(this._flashMemory); }
}

export class MemoryObject extends MemoryBase<any> {

}
const CHILD_DATA_ID = 'ChildData';
export class ParentMemory<T extends MasterDataType> extends MemoryBase<T> {
    constructor(data: T) {
        super(data);
        this._childData = CopyObject(this.GetData(CHILD_DATA_ID))
    }
    private _childData: IDictionary<IData>;
    private _childMemory: IDictionary<MemoryObject> = {}
    HasData(id: string) { return !!this._childData[id] }
    GetMemoryIDs() { return Object.keys(this._childData); }
    CheckoutChildMemory(id: string) {
        if (!this._childMemory[id]) {
            this._childMemory[id] = new MemoryBase(this._childData[id]);
        }
        let mem = this._childMemory[id]
        mem.ReserveMemory();
        return mem;
    }
    SaveChildMemory(childMemory: MemoryObject, saveToMemory: boolean): void {
        if (!this._childMemory[childMemory.id]) {
            this._childMemory[childMemory.id] = childMemory;
        }
        this._childData[childMemory.id] = childMemory.ReleaseMemory();
        if (saveToMemory) {
            this.SetData(CHILD_DATA_ID, this._childData, saveToMemory);
        }
    }
    DeleteChildMemory(id: string, saveToMemory: boolean = true): void {
        if (!!this._childMemory[id]) {
            delete this._childMemory[id];
        }
        if (!!this._childData[id]) {
            delete this._childData[id];
        }
        if (saveToMemory) {
            this.SetData(CHILD_DATA_ID, this._childData, saveToMemory);
        }
    }
}