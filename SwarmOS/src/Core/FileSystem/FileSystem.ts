import { Folder } from "./Folder";

declare var Memory: {
    FileSystem: IDictionary<string, IDictionary<string, MemBase>>;
}
export class FileSystem implements IFileSystem {
    private _memoryCache!: IFolder;
    private _folderCache!: IDictionary<string, IFolder>;
    protected get memory() {
        if (!Memory.FileSystem) {
            Memory.FileSystem = {};
        }
        return Memory.FileSystem;
    }
    protected get MemCache() {
        if (!this._memoryCache) {
            this._memoryCache = new Folder('');
            let keys = Object.keys(this.memory);
            while (keys.length > 0) {
                let memPath = keys.shift();
                if (!memPath || !this.memory[memPath]) {
                    continue;
                }
                let folderData = this.memory[memPath];
                let folderKeys = Object.keys(folderData);
                this.EnsurePath(memPath);
                let folder = this.GetFolder(memPath)!;
                for (let i = 0; i < folderKeys.length; i++) {
                    let fileName = folderKeys[i];
                    folder.SaveFile(fileName, folderData[fileName]);
                }
            }
        }
        return this._memoryCache;
    }
    protected get FolderCache() {
        if (!this._folderCache) {
            this._folderCache = {}
        }
        return this._folderCache;
    }
    SplitPath(pathStr: string): { path: string, name: string } {
        let lastIndex = pathStr.lastIndexOf(C_SEPERATOR);
        return {
            path: pathStr.slice(0, lastIndex),
            name: pathStr.slice(lastIndex + 1)
        }
    }
    GetFolder(pathStr: string): IFolder | undefined {
        if (!this.FolderCache[pathStr]) {
            let curFolder = this.MemCache;
            let path = pathStr.split(C_SEPERATOR);
            for (let i = 1; i < path.length; i++) {
                if (curFolder && curFolder.GetFolder) {
                    curFolder = curFolder.GetFolder(path[i]);
                } else {
                    return undefined;
                }
            }
            this.FolderCache[pathStr] = curFolder;
        }
        return this.FolderCache[pathStr];
    }
    EnsurePath(pathStr: string) {
        if (!this.FolderCache[pathStr]) {
            let path = pathStr.split(C_SEPERATOR);
            let curFolder = this.MemCache;
            for (let i = 1; i < path.length; i++) {
                curFolder.CreateFolder(path[i]);
                curFolder = curFolder.GetFolder(path[i]);
            }
            this.FolderCache[pathStr] = curFolder;
        }
    }
    CreateFolder(path: string, folderName: string) {
        let fullPath = path + C_SEPERATOR + folderName;
        if (!this.FolderCache[fullPath]) {
            let folder = this.GetFolder(path);
            if (!folder) {
                return;
            }
            if (!folder.GetFolder(folderName)) {
                folder.CreateFolder(folderName);
            }
            this.FolderCache[fullPath] = folder.GetFolder(folderName);
        }
    }
    DeleteFolder(path: string, folderName: string) {
        const fullPath = path + C_SEPERATOR + folderName;
        let folder = this.GetFolder(fullPath);
        if (folder) {
            let childFolders = folder.GetFolderNames();
            for (let i = 0; i < childFolders.length; i++) {
                this.DeleteFolder(fullPath, childFolders[i]);
            }
            folder.DeleteFolder();
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
    }
}