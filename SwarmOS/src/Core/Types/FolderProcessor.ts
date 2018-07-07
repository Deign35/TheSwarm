import { ProcessBase } from "./ProcessTypes";

export abstract class FolderProcessor<T> extends ProcessBase {
    EndTick() {
        let folder = this.GetFolder();
        let filesToProcess = folder.GetFileNames();
        while (filesToProcess.length > 0) {
            let fileToProcess = this.memFolder.GetFile<T>(filesToProcess.shift()!)!;
            if (this.ProcessFile(fileToProcess)) {
                this.memFolder.DeleteFile(fileToProcess.fileName);
            }
        }
    }

    abstract GetFolder(): IFolder;
    abstract ProcessFile(file: IFile<T>): boolean;
}