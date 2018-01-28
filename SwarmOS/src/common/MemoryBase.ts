export class MemoryBase implements IMemory {
    readonly MemoryId: string;
    private _cache: any = {};
    private _lock: boolean = false;

    constructor(memId: string) {
        this.MemoryId = memId;
        this.Load();
    };

    dispose() {
        this.Save(true);
    }
    Save(lock: boolean = false): void {
        if(!this._lock) {
            this._lock = lock;
            SwarmOverlord.SaveData(this._cache);
        }
    }
    Load(): void {
        this._cache = SwarmOverlord.LoadData(this.MemoryId);
    }
}