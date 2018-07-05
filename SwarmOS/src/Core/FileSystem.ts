export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        extensionRegistry.register(EXT_FileSystem, new FileSystem());
    }
}
declare var Memory: {
    FileSystem: IDictionary<string, IFile<any>>;
}
const SEPERATOR = '/';
class Folder implements IFolder {
    constructor(public Path: string) {
        if (!Memory.FileSystem) {
            Memory.FileSystem = {};
        }
        this._fileSystemMemory = Memory.FileSystem;
        this._folders = {};
        this._files = {};
    }
    private _fileSystemMemory: IDictionary<string, IFile<any>>;
    private _folders: IDictionary<string, Folder>;
    private _files: IDictionary<string, IFile<any>>;

    SaveFile(fileName: string, mem: IFile<any>) {
        let fullPath = this.Path + SEPERATOR + fileName;
        this._fileSystemMemory[fullPath] = mem;
        this._files[fileName] = mem;
    }
    GetFile(fileName: string) {
        return this._files[fileName];
    }
    DeleteFile(fileName: string) {
        let fullPath = this.Path + SEPERATOR + fileName;
        if (this._fileSystemMemory[fullPath]) {
            delete this._fileSystemMemory[fullPath];
        }
        if (this._files[fileName]) {
            delete this._files[fileName];
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
            let context = this;
            this._memoryCache = new Folder('');
            let keys = Object.keys(this.memory);
            while (keys.length > 0) {
                let memPath = keys.shift();
                if (!memPath || !this.memory[memPath]) {
                    continue;
                }
                let file = this.memory[memPath];
                let fileName = memPath.slice(memPath.lastIndexOf(SEPERATOR) + 1);
                let filePath = memPath.substr(0, memPath.length - fileName.length - 1);
                this.EnsurePath(filePath);
                this.SaveFile(filePath, fileName, file);
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
        if (!this._folderCache[fullPath]) {
            let folder = this.GetFolder(path);
            if (!folder) {
                return;
            }
            if (!folder.GetFolder(folderName)) {
                folder.CreateFolder(folderName);
            }
            this._folderCache[fullPath] = folder.GetFolder(folderName);
        }
    }
    DeleteFolder(path: string, folderName: string) {
        const fullPath = path + SEPERATOR + folderName;
        if (this.FolderCache[fullPath]) {
            delete this.FolderCache[fullPath];
        }
        let folder = this.GetFolder(fullPath);
        if (folder) {
            folder.DeleteFolder();
        }
    }
    SaveFile<T>(path: string, fileName: string, mem: IFile<T>) {
        let folder = this.GetFolder(path);
        if (folder) {
            folder.SaveFile(fileName, mem);
        }
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