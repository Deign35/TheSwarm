import { FolderProcessor } from "Core/Types/FolderProcessor";

declare interface CreepFile {
    creepID: string;
}
class CreepProcessor extends FolderProcessor<CreepFile> {
    GetFolder(): IFolder {
        return this.memFolder;
    }
    ProcessFile(file: IFile<CreepFile>): boolean {
        let creep = Game.creeps[file.Get('creepID')];
        throw new Error("Method not implemented.");
    }
    RunThread(): ThreadState {
        throw new Error("Method not implemented.");
    }
}