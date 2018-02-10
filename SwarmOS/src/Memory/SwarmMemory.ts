const LOCK = 'LK';
export class SwarmMemory implements IMemory {
    protected _cache: Dictionary = {};
    ParentMemoryID: string;
    constructor(public MemoryID: string, public Parent?: SwarmMemory) {
        this.ParentMemoryID = Parent ? Parent.MemoryID : '';
        this.Load();
    }
    GetData(id: string) { return this._cache[id] || undefined; }
    SetData(id: string, data: any) { this._cache[id] = data; }
    DeleteData(id: string) { delete this._cache[id]; }

    Save() {
        this.DeleteData(LOCK);
        if (this._cache) {
            if (this.Parent) {
                this.Parent.SetData(this.MemoryID, this._cache);
            } else {
                Memory[this.MemoryID] = this._cache;
            }
        }

        delete this._cache; // Ensure I don't try reusing data from a memory that isn't checked out.
    }

    Load() {
        if (this.Parent) {
            this._cache = this.Parent.GetData(this.MemoryID) || {};
        } else {
            this._cache = Memory[this.MemoryID] || {};
        }

        if (this.GetData(LOCK)) {
            console.log('MEMORY ACCESS ERROR');
            //throw new Error('MEMORY ACCESS ERROR');
        }
        this.SetData(LOCK, true);
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