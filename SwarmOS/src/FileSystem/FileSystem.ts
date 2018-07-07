import { Folder } from "./Folder";

declare var Memory: {
    FileSystem: IDictionary<string, IDictionary<string, MemBase>>;
}

let version = 0;
export class FileSystem implements IFileSystem {
    private _beginTick: number;
    constructor(private rootFolderName: string, private _memory: IDictionary<string, IDictionary<string, MemBase>>) {
        this._beginTick = Game.time;
        this._fsHash = `${Game.time}_${version++}`;
        let keys = Object.keys(this.memory);
        this._rootDrive = new Folder(rootFolderName, this.memory);
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
                folder.CreateFile(fileIDs[i], folderData[fileIDs[i]]);
            }
        }
    }
    private _fsHash: string;
    get FSHash() {
        return this._fsHash;
    }
    protected get memory() {
        if (!this._memory[this.rootFolderName]) {
            this._memory[this.rootFolderName] = {};
        }
        return this._memory;
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
            this.FolderCache[pathStr] = new Folder(pathStr, this.memory);
        }
    }

    RecordStats() {
        //let folderStats = {};
        GStats.addStat(`FS${C_SEPERATOR}${this.rootFolderName}${C_SEPERATOR}${this.FSHash}`, {
            //folderStats: folderStats,
            numFolders: Object.keys(this._folderCache).length,
            size: JSON.stringify(this._memory).length,
            start: this._beginTick,
        });
    }
}