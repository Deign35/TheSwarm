import { ExtensionBase } from "../Core/BasicTypes";

export const OSPackage: IPackage<SpawnRegistry_Memory> = {
    install(processRegistry: IProcessRegistry, extensionRegistry: IExtensionRegistry) {
        extensionRegistry.register(EXT_FileRegistry, new FileRegistry(extensionRegistry));
    }
}

declare interface IFolder {
    c: IDictionary<string, IFolder>;    // (c)hild folders
    f: IDictionary<string, IFile<any>>;      // (f)iles
    p: string;                          // (p)ath
}
declare var Memory: {
    FileSystem: IDictionary<string, IFile<any>>;
}
const SEPERATOR = '/';
export class FileRegistry extends ExtensionBase implements IFileRegistry {
    private _memoryCache!: IFolder;
    private _pathCache!: IDictionary<string, string[]>;
    protected get memory() {
        if (!Memory.FileSystem) {
            Memory.FileSystem = {};
        }
        return Memory.FileSystem;
    }
    protected get MemCache() {
        if (!this._memoryCache) {
            this._memoryCache = {
                c: {},
                f: {},
                p: '',
            }
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
    protected get PathCache() {
        if (!this._pathCache) {
            this._pathCache = {}
        }
        return this._pathCache;
    }
    GetFolder(pathStr: string) {
        let mem = this.MemCache;
        let path = this.PathCache[pathStr];
        if (!path) {
            path = pathStr.split(SEPERATOR);
            this.PathCache[pathStr] = path;
        }
        for (let i = 1, length = path.length; i < length; i++) {
            if (mem.c && mem.c[path[i]]) {
                mem = mem.c[path[i]];
            } else {
                return undefined;
            }
        }

        return mem;
    }
    EnsurePath(pathStr: string) {
        let path = this.PathCache[pathStr];
        if (!path) {
            //path = pathStr.split(/[\/\\]/gi);
            path = pathStr.split(SEPERATOR);
            this.PathCache[pathStr] = path;
        }
        let curPath = '';
        for (let i = 1; i < path.length; i++) {
            let nextFolder = path[i];
            let nextPath = curPath + SEPERATOR + nextFolder;
            if (!this.GetFolder(nextPath) && !this.CreateFolder(curPath, nextFolder)) {
                throw new Error(`Failed to create path(${pathStr}).  Loop[${i}](curPath(${curPath}), nextFolder(${nextFolder})`);
            }
            curPath = nextPath;
        }
    }
    CreateFolder(path: string, folderName: string): boolean {
        let folder = this.GetFolder(path);
        if (folder) {
            if (!folder.c[folderName]) {
                folder.c[folderName] = {
                    c: {},
                    f: {},
                    p: path,
                }
            }
            return true;
        }
        return false;
    }
    DeleteFolder(path: string, folderName: string) {
        let folder = this.GetFolder(path);
        if (folder && folder.c[folderName]) {
            const fullPath = path + SEPERATOR + folderName;
            let fileNames = Object.keys(folder.c[folderName].f);
            for (let i = 0; i < fileNames.length; i++) {
                this.DeleteFile(fullPath, fileNames[i]);
            }
            let childFolders = Object.keys(folder.c[folderName].c);
            for (let i = 0; i < childFolders.length; i++) {
                this.DeleteFolder(fullPath, childFolders[i]);
            }
            delete folder.c[folderName];
        }
    }
    SaveFile<T>(path: string, fileName: string, mem: IFile<T>): boolean {
        let folder = this.GetFolder(path);
        if (folder) {
            let filePath = path + SEPERATOR + fileName;
            this.memory[filePath] = mem;
            folder.f[fileName] = this.memory[filePath]
            return true;
        }
        return false;
    }
    GetFile<T>(path: string, fileName: string): IFile<T> | undefined {
        let folder = this.GetFolder(path);
        if (folder) {
            return folder.f[fileName] && folder.f[fileName];
        }
        return undefined;
    }
    DeleteFile(path: string, fileName: string): void {
        let folder = this.GetFolder(path);
        if (folder && folder.f[fileName]) {
            let fullPath = path + SEPERATOR + fileName;
            if (this.memory[fullPath]) {
                delete this.memory[fullPath];
            }
            delete folder.f[fileName];
        }
    }
    CopyFile(fromPath: string, fileName: string, toPath: string, deleteOriginal: boolean = true, newFileName?: string): boolean {
        let file = this.GetFile(fromPath, fileName);
        if (!file) { return false; }
        if (deleteOriginal) {
            this.DeleteFile(fromPath, fileName);
        }
        return this.SaveFile(toPath, newFileName || fileName, file);
    }
}