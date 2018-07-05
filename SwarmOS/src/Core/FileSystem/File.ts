declare var Memory: {
    FileSystem: IDictionary<string, IDictionary<string, MemBase>>;
}

export class File<T> implements IFile<T> {
    constructor(private _folderPath: string, private _fileName: string, private _contents: T) {
        this._lastUpdated = Game.time;
    }
    set contents(overWrite: T) {
        this._contents = overWrite;
        this._lastUpdated = Game.time;
    }
    get contents(): T {
        return this._contents;
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