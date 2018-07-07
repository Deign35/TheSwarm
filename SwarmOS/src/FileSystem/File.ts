export class File<T> implements IFile<T> {
    GetRawFileData(): T {
        return this._contents;
    }
    Get<U extends keyof T>(id: U): T[U] {
        return this._contents[id];
    }
    Set<U extends keyof T>(id: U, val: T[U]): void {
        this._contents[id] = val;
    }
    Remove(id: string) {
        delete this._contents[id];
    }
    GetDataIDs() {
        return Object.keys(this._contents);
    }
    constructor(private _folderPath: string, private _fileName: string, private _contents: T) {
        this._lastUpdated = Game.time;
    }
    get filePath(): string {
        return this.folderPath + C_SEPERATOR + this.fileName;
    }
    get folderPath(): string {
        return this._folderPath;
    }
    get fileName(): string {
        return this._fileName;
    }
    private _lastUpdated: number;
    get lastUpdated(): number {
        return this._lastUpdated;
    }
}