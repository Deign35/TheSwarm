declare interface IFileSystem {
    GetDrive(drive: string): IDrive | undefined
    LoadRawDriveData(drive: string): any;
    readonly FSHash: string;
}

declare const DFS: IFileSystem;
declare interface IDrive {
    readonly Path: string;
    LoadedHash: string;
    EnsurePath(path: string): IFolder;
    GetFolder(path: string): IFolder | undefined;
    SaveFile<T>(file: IFile<T>): void;
}
declare interface IFolder {
    readonly Path: string;
    GetFileNames(): string[];
    SaveFile<T>(mem: IFile<T>): void;
    GetFile<T>(fileName: string): IFile<T> | undefined;
    DeleteFile(fileName: string): void;
    DeleteFiles(): void;

    ReloadContents(data: any): void;
}
declare interface IFile<T> {
    contents: T;
    readonly filePath: string;
    readonly folderPath: string;
    readonly fileName: string;
}

declare type IDictionary<T extends string, U> = { [id in T]: U };
declare var Game: {
    time: number;
}
declare var Memory: {
    FileSystem: IDictionary<string, IDictionary<string, any>>;
}
