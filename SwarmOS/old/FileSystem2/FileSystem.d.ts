declare interface IFileSystem2 extends IPackageExtension {
    GetDrive(drive: string): IDrive | undefined
    LoadRawDriveData(drive: string): any;
    readonly FSHash: string;
}

declare const MasterFS2: IFileSystem2;
declare interface IDrive {
    readonly Path: string;
    LoadedHash: string;
    EnsurePath(path: string): IFolder2;
    GetFolder(path: string): IFolder2 | undefined;
    SaveFile<T>(file: IFile2<T>): void;
}
declare interface IFolder2 {
    readonly Path: string;
    GetFileNames(): string[];
    SaveFile<T>(mem: IFile2<T>): void;
    GetFile<T>(fileName: string): IFile2<T> | undefined;
    DeleteFile(fileName: string): void;
    DeleteFiles(): void;

    ReloadContents(data: any): void;
}
declare interface IFile2<T> {
    contents: T;
    readonly filePath: string;
    readonly folderPath: string;
    readonly fileName: string;
}