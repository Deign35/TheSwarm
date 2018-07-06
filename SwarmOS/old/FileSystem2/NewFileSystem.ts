import { DDrive } from "./Drive";
export class FileSystem2 implements IFileSystem {
    private static version = 0;
    constructor() {
        this._hash = `${Game.time}_${FileSystem2.version++}`;
        this._drives = {};
        let driveIDs = Object.keys(Memory.FileSystem);
        for (let i = 0; i < driveIDs.length; i++) {
            this._drives[driveIDs[i]] = new DDrive(driveIDs[i]);
        }
    }

    private _hash: string;
    get FSHash() {
        return this._hash;
    }

    private _drives: IDictionary<string, IDrive>;
    protected get Drives() {
        return this._drives;
    }
    GetDrive(drive: string): IDrive | undefined {
        return this._drives[drive];
    }
    LoadRawDriveData(drive: string) {
        return Memory.FileSystem[drive];
    }
}