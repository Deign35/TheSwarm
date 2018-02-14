abstract class _SwarmMemory implements IMemory {
    constructor(public readonly id: string, public Parent?: IMemory) { }
    protected _cache: { [id: string]: any } = {};
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
}

export abstract class QueenMemory extends _SwarmMemory {
    constructor(id: string) {
        super(id);
    }
    Save() {
        Memory[this.id] = this._cache;
    }
    Load() {
        this._cache = Memory[this.id];
    }
}

export abstract class ChildMemory extends _SwarmMemory {
    constructor(id: string, public Parent: QueenMemory) {
        super(id, Parent);
    }
    Save() {
        this.Parent.SetData(this.id, this._cache);
    }
    Load() {
        this._cache = this.Parent.GetData(this.id) || {};
    }
}