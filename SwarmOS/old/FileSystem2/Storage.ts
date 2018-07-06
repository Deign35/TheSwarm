export abstract class Storage<T> {
    constructor(public readonly Path: string) {
        this.LoadContents();
    }
    private static version = 0;
    private _fsHash!: string;
    get LoadedHash() {
        return this._fsHash;
    }
    protected SetHash(hash: string) {
        this._fsHash = hash;
    }
    protected abstract LoadContents(): void;
    private _cache!: T;
    get memory() {
        if (this.LoadedHash != DFS.FSHash) {
            this.LoadContents();
        }
        return this._cache;
    }
    protected SetCache(cache: T) {
        this._cache = cache;
    }
}