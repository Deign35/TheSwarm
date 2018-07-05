import { ExtensionBase } from "./BasicTypes";

declare var Memory: {
    FileSystem: IDictionary<string, MemBase>;
}
const SEPERATOR = '/';

class File<T> implements IFile<T> {
    constructor(private _pathStr: string, private _contents: T) {
        let { path, name } = MasterFS.SplitPath(_pathStr);
        this._folderPath = path;
        this._fileName = name;
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
        return this._pathStr;
    }
    private _folderPath: string;
    get folderPath(): string {
        return this._folderPath;
    }
    private _fileName: string;
    get fileName(): string {
        return this._fileName;
    }
    private _lastUpdated: number;
    get lastUpdated(): number {
        return this._lastUpdated;
    }
}
class Folder implements IFolder {
    constructor(public Path: string) {
        if (!Memory.FileSystem) {
            Memory.FileSystem = {};
        }
        this._fileSystemMemory = Memory.FileSystem;
        this._folders = {};
        this._files = {};
    }
    private _fileSystemMemory: IDictionary<string, MemBase>;
    private _folders: IDictionary<string, Folder>;
    private _files: IDictionary<string, File<any>>;

    GetFolderNames() {
        return Object.keys(this._folders);
    }
    GetFileNames() {
        return Object.keys(this._files);
    }

    SaveFile<T>(fileName: string, mem: T) {
        let fullPath = this.Path + SEPERATOR + fileName;
        this._fileSystemMemory[fullPath] = mem;
        if (!this.GetFile(fileName)) {
            this._files[fileName] = new File(fullPath, mem);
        }
        this._files[fileName].contents = mem;
    }
    GetFile<T>(fileName: string): File<T> | undefined {
        return this._files[fileName]
    }
    DeleteFile(fileName: string) {
        let file = this.GetFile(fileName);
        if (file) {
            if (this._fileSystemMemory[file.filePath]) {
                delete this._fileSystemMemory[file.filePath];
            }
            delete this._files[file.fileName];
        }
    }
    GetFolder(folderName: string) {
        return this._folders[folderName];
    }
    CreateFolder(folderName: string) {
        if (!this._folders[folderName]) {
            this._folders[folderName] = new Folder(this.Path + SEPERATOR + folderName);
        }
    }
    DeleteFolder() {
        let fileNames = Object.keys(this._files);
        for (let i = 0; i < fileNames.length; i++) {
            this.DeleteFile(fileNames[i]);
        }
        let folderNames = Object.keys(this._folders);
        for (let i = 0; i < folderNames.length; i++) {
            this._folders[folderNames[i]].DeleteFolder();
        }
    }
}
export class FileSystem extends ExtensionBase implements IFileSystem {
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
                let file = this.memory[memPath];
                let { path, name } = this.SplitPath(memPath);
                this.EnsurePath(path);
                this.GetFolder(path)!.SaveFile(name, file);
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
        let lastIndex = pathStr.lastIndexOf(SEPERATOR);
        return {
            path: pathStr.slice(0, lastIndex - 1),
            name: pathStr.slice(lastIndex + 1)
        }
    }
    GetFolder(pathStr: string): IFolder | undefined {
        if (!this.FolderCache[pathStr]) {
            let curFolder = this.MemCache;
            let path = pathStr.split(SEPERATOR);
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
            let path = pathStr.split(SEPERATOR);
            let curFolder = this.MemCache;
            for (let i = 1; i < path.length; i++) {
                curFolder.CreateFolder(path[i]);
                curFolder = curFolder.GetFolder(path[i]);
            }
            this.FolderCache[pathStr] = curFolder;
        }
    }
    CreateFolder(path: string, folderName: string) {
        let fullPath = path + SEPERATOR + folderName;
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
        const fullPath = path + SEPERATOR + folderName;
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