export class SwarmMemory implements IMemory {
    protected _cache: Dictionary = {};
    constructor(public MemoryID: string, public Parent?: SwarmMemory) { this.Load(); }
    GetData(id: string) { return this._cache[id] || undefined; }
    SetData(id: string, data: any) { this._cache[id] = data; }
    DeleteData(id: string) { delete this._cache[id]; }

    Save() {
        if (this._cache) {
            if (this.Parent) {
                this.Parent.SetData(this.MemoryID, this._cache);
            } else {
                Memory[this.MemoryID] = this._cache;
            }
        }
    }

    Load() {
        if (this.Parent) {
            this._cache = this.Parent.GetData(this.MemoryID) || {};
        } else {
            this._cache = Memory[this.MemoryID] || {};
        }
    }

    Copy(copyID: string) {
        if (this.Parent) {
            this.Parent.SetData(copyID, this._cache);
        } else {
            Memory[copyID] = this._cache;
        }
    }
    ForEach(inFunc: SwarmMemoryCallback) {
        for (let name in this._cache) {
            inFunc(name, this._cache[name]);
        }
    }
}
declare type SwarmMemoryCallback = (name: string, item: any) => void;