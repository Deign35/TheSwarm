import { Folder } from "./Folder";

declare var Memory: {
    FileSystem: IDictionary<string, IDictionary<string, MemBase>>;
}

let version = 0;
export class FileSystem implements IFileSystem {
    constructor(private rootFolderName: string) {
        this._fileTick = `${Game.time}_${version++}`;
        let keys = Object.keys(this.memory);
        this._rootDrive = new Folder(rootFolderName);
        this._folderCache = {}
        while (keys.length > 0) {
            let memPath = keys.shift();
            if (!memPath || !this.memory[memPath]) {
                continue;
            }
            let folderData = this.memory[memPath];
            let fileIDs = Object.keys(folderData);

            this.EnsurePath(memPath);
            let folder = this.GetFolder(memPath)!;
            for (let i = 0; i < fileIDs.length; i++) {
                let fileName = fileIDs[i];
                folder.SaveFile(fileName, folderData[fileName]);
            }
        }
    }
    private _fileTick: string;
    get InstanceHash() {
        return this._fileTick;
    }
    protected get memory() {
        if (!Memory.FileSystem) {
            Memory.FileSystem = {};
        }
        if (!Memory.FileSystem[this.rootFolderName]) {
            Memory.FileSystem[this.rootFolderName] = {};
        }
        return Memory.FileSystem;
    }
    private _rootDrive: IFolder;
    protected get Drive() {
        return this._rootDrive;
    }
    private _folderCache: IDictionary<string, IFolder>;
    protected get FolderCache() {
        return this._folderCache;
    }
    GetFolder(pathStr: string): IFolder | undefined {
        return this.FolderCache[pathStr];
    }
    EnsurePath(pathStr: string) {
        if (!this.FolderCache[pathStr]) {
            this.FolderCache[pathStr] = new Folder(pathStr);
        }
    }
    /*CreateFolder(path: string, folderName: string) {
        this.EnsurePath(`${path}${C_SEPERATOR}${folderName}`);
    }
    /*DeleteFolder(path: string, folderName: string) {
        const fullPath = `${path}${C_SEPERATOR}${folderName}`;
        let folder = this.GetFolder(fullPath);
        if (folder) {
            let childFolders = folder.GetFolderNames();
            for (let i = 0; i < childFolders.length; i++) {
                this.DeleteFolder(fullPath, childFolders[i]);
            }
            folder.DeleteFiles();
        }
        if (this.FolderCache[fullPath]) {
            delete this.FolderCache[fullPath];
        }
    }
    SaveFile<T>(path: string, fileName: string, mem: T) {
        let folder = this.GetFolder(path);
        if (!folder) {
            throw new Error(`Error(${ERR_NOT_FOUND})--FileSystem.SaveFile(path[${path}])`);
        }
        if (!folder.GetFile(fileName)) {
            folder.SaveFile(fileName, mem);
        }
        let file = folder.GetFile(fileName)!;
        file.contents = mem;
    }
    GetFile<T>(path: string, fileName: string): IFile<T> | undefined {
        let folder = this.GetFolder(path);
        if (folder) {
            return folder.GetFile(fileName)
        }
        return undefined;
    }
    DeleteFile(path: string, fileName: string): void {
        let folder = this.GetFolder(path);
        if (folder) {
            folder.DeleteFile(fileName);
        }
    }
    CopyFile(fromPath: string, fileName: string, toPath: string, deleteOriginal: boolean = true, newFileName?: string): boolean {
        let file = this.GetFile(fromPath, fileName);
        if (!file) { return false; }
        if (deleteOriginal) {
            this.DeleteFile(fromPath, fileName);
        }
        this.SaveFile(toPath, newFileName || fileName, file);
        return true;
    }*/
}