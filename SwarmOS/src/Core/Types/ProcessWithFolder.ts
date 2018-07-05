import { ProcessBase } from "./ProcessTypes";

export abstract class ProcessBase_Storage extends ProcessBase<any> {
    private _folderPath!: string;
    get FolderPath(): string {
        if (!this._folderPath) {
            this._folderPath = this.memPath + C_SEPERATOR + this.pid;
        }
        return this._folderPath;
    }
    folder!: IFolder;
    PrepTick() {
        let folderPath = MasterFS.EnsurePath(this.FolderPath);
        this.folder = MasterFS.GetFolder(this.FolderPath)!;
        super.PrepTick();
    }
}