import { Folder } from "./Folder";
abstract class Storage<T> {
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
        if (this.LoadedHash != MasterFS2.FSHash) {
            this.LoadContents();
        }
        return this._cache;
    }
    protected SetCache(cache: T) {
        this._cache = cache;
    }
}
export class FileDrive extends Storage<IDictionary<string, IFolder2>> implements IDrive {
    private _rootFolder!: IFolder2;
    protected get rootFolder() {
        if (this.LoadedHash != MasterFS2.FSHash) {
            this.LoadContents();
        }
        return this._rootFolder;
    }

    protected LoadContents() {
        this.SetHash(MasterFS2.FSHash)
        let data = MasterFS2.LoadRawDriveData(this.Path);
        let keys = Object.keys(data);

        if (!this._rootFolder) {
            this.SetCache({});
            this._rootFolder = new Folder2(this, this.Path);
        }
        while (keys.length > 0) {
            let memPath = keys.shift();
            if (!memPath) {
                continue;
            }
            let folderData = data[memPath];
            let fileIDs = Object.keys(folderData);
            let folder = this.EnsurePath(memPath);
            for (let i = 0; i < fileIDs.length; i++) {
                let file = new File2(this, memPath, fileIDs[i], folderData[fileIDs[i]]);
                folder.SaveFile(file);
            }
        }
    }
    GetFolder(pathStr: string): IFolder2 | undefined {
        if (this.LoadedHash != MasterFS2.FSHash) {
            this.LoadContents();
        }
        return this.memory[pathStr];
    }
    EnsurePath(pathStr: string) {
        if (this.LoadedHash != MasterFS2.FSHash) {
            this.LoadContents();
        }
        if (!this.memory[pathStr]) {
            this.memory[pathStr] = new Folder2(this, pathStr);
        }

        return this.memory[pathStr];
    }
    SaveFile<T>(file: IFile2<T>) {

    }
}

class Folder2 implements IFolder2 {
    constructor(drive: IDrive, path: string) {
        this.Path = path;
        this.Drive = drive;
        this._files = {};
    }
    readonly Path: string;
    protected readonly Drive: IDrive;
    private _files: IDictionary<string, IFile2<any>>;
    private _fsHash!: string;
    get LoadedHash() {
        return this._fsHash;
    }

    ReloadContents(data: any): void {
        this._fsHash = this.Drive.LoadedHash;
        let keys = Object.keys(data);
        this._files = {}
        while (keys.length > 0) {
            let memPath = keys.shift();
            if (!memPath) {
                continue;
            }
            let folderData = data[memPath];
            let fileIDs = Object.keys(folderData);
            let folder = this.Drive.EnsurePath(memPath);
            for (let i = 0; i < fileIDs.length; i++) {
                let file = new File2(this.Drive, memPath, fileIDs[i], folderData[fileIDs[i]]);
                folder.SaveFile(file);
            }
        }
    }
    GetFileNames() {
        return Object.keys(this._files);
    }
    SaveFile<T>(file: IFile2<T>) {
        this.Drive.SaveFile(file);
    }
    GetFile<T>(fileName: string): IFile2<T> | undefined {
        return this._files[fileName]
    }
    DeleteFile(fileName: string) {
        let file = this.GetFile(fileName);
        if (file) {
            if (this._fileSystemMemory[file.folderPath]) {
                delete this._fileSystemMemory[file.folderPath][fileName];
            }
            delete this._files[file.fileName];
        }
    }
    DeleteFiles() {
        let fileNames = Object.keys(this._files);
        for (let i = 0; i < fileNames.length; i++) {
            this.DeleteFile(fileNames[i]);
        }
    }
}

class File2<T> implements IFile2<T> {
    constructor(private _drive: IDrive, private _folderPath: string, private _fileName: string, private _contents: T) {
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