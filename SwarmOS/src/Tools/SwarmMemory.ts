export abstract class SwarmMemory implements IMemory {
    constructor(public readonly id: string, public Parent: IMemory) {
        if (!this.Load()) {
            this.InitMemory();
            this.Save();
            this.Load();
        }
    }
    protected _cache: { [id: string]: any } = {}; // this probably shouldn't be initialized like this
    protected _snapshot?: { [id: string]: any };
    Save() {
        if (this._snapshot) {
            console.log('SNAPSHOT NOT RESET, RELOADING OLD DATA[' + this.id + ']');
            this.ReloadSnapshot(true);
        }
        if (this.Parent) {
            this.Parent.SetData(this.id, this._cache);
        } else {
            Memory[this.id] = this._cache;
        }
        delete this._cache;
    }
    Load() {
        if (this.Parent) {
            this._cache = this.Parent.GetData(this.id);
        } else {
            this._cache = Memory[this.id];
        }

        if (!this._cache) { return false; }

        return true;
    }
    GetData(id: string) {
        return this._cache[id];
    }
    SetData(id: string, data: any): void {
        this._cache[id] = data;
    }
    RemoveData(id: string) {
        delete this._cache[id];
    }
    SnapshotData() {
        if (!this._snapshot) {
            this._snapshot = {};
            Object.assign(this._snapshot, this._cache);
        }
    }
    ReloadSnapshot(del: boolean = false) {
        if (this._snapshot) {
            Object.assign(this._cache, this._snapshot);
            if (del) {
                this.ResetSnapshotData();
            }
        }
    }
    ResetSnapshotData() {
        this._snapshot = undefined;
    }

    protected InitMemory() {
        this._cache = {};
    }
}