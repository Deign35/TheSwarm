import { MemoryLockException } from "Tools/SwarmExceptions";

export abstract class MemoryBase {
    constructor() {
        this._checkedOut = false;
        this._flashMemory = {};
    }
    protected abstract get cache(): IData<SwarmDataType>;
    private _flashMemory: Dictionary;
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
    ReleaseMemory(): SwarmData {
        if (!this._checkedOut) {
            throw new MemoryLockException(this._checkedOut, "Memory not checked out");
        }

        this._checkedOut = false;
        return this.cache;
    }

    GetMemoryIDs(): string[] { return Object.keys(this.cache); }
    HasMemory(id: string): boolean {
        return !!(this.cache[id]);
    }

    GetFlashData<T>(id: string): T {
        return this._flashMemory[id];
    }
    SetFlashData<T>(id: string, data: T): void {
        this._flashMemory[id] = data;
    }
    RemoveFlashData(id: string): void {
        delete this._flashMemory[id];
    }
}

export abstract class SwarmMemoryBase<T extends SwarmDataType, U extends SwarmType, V extends SwarmSubType, X extends ISwarmData<T, U, V>>
    extends MemoryBase implements ISwarmData<T, U, V> {
    protected abstract get cache(): X;
    abstract get MEM_TYPE(): T;
    abstract get SWARM_TYPE(): U;
    abstract get SUB_TYPE(): V;
}

export abstract class SwarmMemoryWithSpecifiedData<T extends SwarmData>
    extends SwarmMemoryBase<SwarmDataType, SwarmType, SwarmSubType, T> implements SwarmData {
    constructor(data: T) {
        super();
        this._cache = data;
    }
    private _cache: T;
    protected get cache() { return this._cache; }
}

export type MasterableSwarmMemory = SwarmMemoryWithSpecifiedData<SwarmData>;
export type SwarmMemory = SwarmMemoryWithSpecifiedData<SwarmData>;