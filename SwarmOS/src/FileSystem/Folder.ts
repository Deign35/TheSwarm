import { File } from "./File";
export class Folder implements IFolder {
    constructor(public Path: string, rootMemory: IDictionary<string, IDictionary<string, MemBase>>) {
        this._fileSystemMemory = rootMemory;
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
    CreateFile<T>(fileName: string, contents?: T) {
        if (!this._files[fileName]) {
            this._fileSystemMemory[this.Path][fileName] = contents || {};
            this._files[fileName] = new File(this.Path, fileName, this._fileSystemMemory[this.Path][fileName]);
        }

        return this.GetFile<T>(fileName)!;
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