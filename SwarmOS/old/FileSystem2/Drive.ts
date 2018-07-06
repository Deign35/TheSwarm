import { Storage } from "./Storage";

export class DDrive extends Storage<IDictionary<string, IFolder>> implements IDrive {
    private _rootFolder!: IFolder;
    protected get rootFolder() {
        if (this.LoadedHash != DFS.FSHash) {
            this.LoadContents();
        }
        return this._rootFolder;
    }

    protected LoadContents() {
        this.SetHash(DFS.FSHash)
        let data = DFS.LoadRawDriveData(this.Path);
        let keys = Object.keys(data);

        if (!this._rootFolder) {
            this.SetCache({});
            this._rootFolder = new DFolder(this, this.Path);
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
                let file = new DFile(this, memPath, fileIDs[i], folderData[fileIDs[i]]);
                folder.SaveFile(file);
            }
        }
    }
    GetFolder(pathStr: string): IFolder | undefined {
        if (this.LoadedHash != DFS.FSHash) {
            this.LoadContents();
        }
        return this.memory[pathStr];
    }
    EnsurePath(pathStr: string) {
        if (this.LoadedHash != DFS.FSHash) {
            this.LoadContents();
        }
        if (!this.memory[pathStr]) {
            this.memory[pathStr] = new DFolder(this, pathStr);
        }

        return this.memory[pathStr];
    }
    SaveFile<T>(file: IFile<T>) {

    }
}
