import { LoadFromMemory } from "./MemoryBacking";

const LOCK = 'MEM_LOCK';

abstract class MemoryBase implements IMemory {
    constructor(id: string) {
        this.id = id;
    }
    readonly id: string;
    protected _cache: {[id: string]: any} = {};
    protected abstract LoadCache(): void;
    abstract Save(): void;
    GetData(id: string) {
        return this._cache[id];
    }
    SetData(id: string, data: any): void {
        this._cache[id] = data;
    }
    RemoveData(id: string) {
        delete this._cache[id];
    }

    protected UpdateLockState(state: boolean) {
        debugger;
        if((!!this.GetData(LOCK)) == state) {
            console.log('Error: Expected[' + state + '], but Lock was different');
            this.RemoveData(LOCK);
            throw "MEMORY ACCESS DENIED";
        }
        if(state) {
            this.SetData(LOCK, state);
        } else {
            this.RemoveData(LOCK);
        }
    }
}

export abstract class SwarmMemory extends MemoryBase {
    protected _cache!: {[dataID: string]: any}
    constructor(id: string) {
        super(id);
        this.LoadCache();
    }
    Save() {
        this.FinalizeCache();
        this.UpdateLockState(false);
        Memory[this.id] = this._cache;
    }
    protected abstract FinalizeCache(): void;
    protected LoadCache() {
        let tempObject = LoadFromMemory(this.id); // Memory[this.id] || {};
        this.PushToCache(tempObject);
        this.UpdateLockState(true);
    }

    private PushToCache(tempObject: any) {
        this._cache = tempObject;
    }
}

export abstract class ChildMemory extends MemoryBase {
    constructor(public Parent: SwarmMemory, id: string,) {
        super(id);
        this.LoadCache();
    }
    Save() {
        this.FinalizeCache();
        this.UpdateLockState(false);
        this.Parent.SetData(this.id, this._cache);
    }
    protected abstract FinalizeCache(): void;
    protected LoadCache() {
        this._cache = this.Parent.GetData(this.id) || {};
        this.UpdateLockState(true);
    }
}

export class TestSwarmMemory extends SwarmMemory {
    protected FinalizeCache(): void { }
}
export class TestChildMemory extends ChildMemory {
    protected FinalizeCache(): void { }
}