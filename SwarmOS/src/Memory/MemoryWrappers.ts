export abstract class MemoryWrapper implements IMemory {
    id: string;
    private _cache: { [id: string]: any } = {}; // Need to make a container class for this, just call it a dictionary

    constructor(memId: string) {
        this.id = memId;
        this.Load();
    }

    dispose() { this._save(true); }

    abstract Save(force: boolean): void;
    abstract Load(): void;
    abstract GetData(id: string): any;
    abstract SetData(id: string, data: any): void;

    protected _save(toMemory: boolean = false): void {
        let thisId = this.id;
        delete this.id;
        SwarmOverlord.SaveData(thisId, this);
        if (toMemory) {
            Memory[thisId] = this._cache;
        }
        this.id = thisId;
    }
    protected _load(): void {
        this._cache = SwarmOverlord.LoadData(this.id);
    }
    protected _getData(id: string) {
        return this._cache[id] || undefined;
    }

    protected _setData(id: string, data: any) {
        this._cache[id] = data;
    }
}

export class SimpleMemory extends MemoryWrapper {
    Save(force: boolean = false) {
        this._save(force);
    }
    Load() {
        this._load();
    }
    GetData(id: string): any {
        this._getData(id);
    }
    SetData(id: string, data: any) {
        this._setData(id, data);
    }
}

export class AutoSaveMemory extends SimpleMemory {
    constructor(id: string, public PushInterval: t_PushInterval = t_PushInterval.Every) {
        super(id);
    }
    protected saveCount = 0;
    SetData(id: string, dataObj: any) {
        this._setData(id, dataObj);
        this.saveCount++;
        if (this.saveCount >= this.PushInterval) {
            this.Save(true);
            this.saveCount = 0;
        }
    }
}

export enum t_PushInterval {
    Never,
    Every = 1,
    Third = 3,
    Fifth = 5,
    Tenth = 10,
}