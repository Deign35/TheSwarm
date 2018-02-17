export abstract class _SwarmMemory implements IMemory {
    constructor(public readonly id: string, public Parent?: IMemory) {
        if (!this.Load()) {
            this.InitMemory();
            this.Load();
        }
    }
    protected _cache: { [id: string]: any } = {};
    protected _snapshot?: { [id: string]: any };

    abstract Load(): void;
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

    }
}

export abstract class QueenMemory extends _SwarmMemory {
    constructor(id: string) {
        super(id);
    }
    Save() {
        if (this._snapshot) {
            console.log('SNAPSHOT NOT RESET, RELOADING OLD DATA[' + this.id + ']');
            this.ReloadSnapshot(true);
        }
        Memory[this.id] = this._cache;
    }
    Load() {
        this._cache = Memory[this.id];
        if (!this._cache) { return false; }
        return true;
    }
}

export abstract class ChildMemory extends _SwarmMemory {
    constructor(id: string, public Parent: _SwarmMemory) {
        super(id, Parent);
    }
    Save() {
        if (this._snapshot) {
            console.log('SNAPSHOT NOT RESET, RELOADING OLD DATA[' + this.Parent.id + '.' + this.id + ']');
            this.ReloadSnapshot(true);
        }
        this.Parent.SetData(this.id, this._cache);
        delete this._cache;
    }
    Load() {
        this._cache = this.Parent.GetData(this.id);

        if (!this._cache) { return false; }

        return true;
    }
}