import { File } from "./File";

declare var Memory: {
    FileSystem: IDictionary<string, IDictionary<string, MemBase>>;
}

export class Folder implements IFolder {
    constructor(public Path: string) {
        if (!Memory.FileSystem) {
            Memory.FileSystem = {};
        }
        this._fileSystemMemory = Memory.FileSystem;
        if (!this._fileSystemMemory[this.Path]) {
            this._fileSystemMemory[this.Path] = {};
        }
        this._files = {};
        let keys = Object.keys(this._fileSystemMemory[this.Path]);
        for (let i = 0; i < keys.length; i++) {
            this._files[keys[i]] = new File(this.Path, keys[i], this._fileSystemMemory[this.Path][keys[i]]);
        }
    }

    private _fileSystemMemory: IDictionary<string, MemBase>;
    private _files: IDictionary<string, File<any>>;

    GetFileNames() {
        return Object.keys(this._files);
    }
    SaveFile<T>(fileName: string, mem: T) {
        this._fileSystemMemory[this.Path][fileName] = mem;
        if (!this.GetFile(fileName)) {
            this._files[fileName] = new File(this.Path, fileName, mem);
        }
        this._files[fileName].contents = mem;
    }
    GetFile<T>(fileName: string): File<T> | undefined {
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