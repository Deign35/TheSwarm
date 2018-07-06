
class DFolder implements IFolder {
    constructor(drive: IDrive, path: string) {
        this.Path = path;
        this.Drive = drive;
        this._files = {};
    }
    readonly Path: string;
    protected readonly Drive: IDrive;
    private _files: IDictionary<string, IFile<any>>;
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
                let file = new DFile(this.Drive, memPath, fileIDs[i], folderData[fileIDs[i]]);
                folder.SaveFile(file);
            }
        }
    }
    GetFileNames() {
        return Object.keys(this._files);
    }
    SaveFile<T>(file: IFile<T>) {
        this.Drive.SaveFile(file);
    }
    GetFile<T>(fileName: string): IFile<T> | undefined {
        return this._files[fileName]
    }
    DeleteFile(fileName: string) {
        let file = this.GetFile(fileName);
        if (file) {
            /*if (this._fileSystemMemory[file.folderPath]) {
                delete this._fileSystemMemory[file.folderPath][fileName];
            }*/
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