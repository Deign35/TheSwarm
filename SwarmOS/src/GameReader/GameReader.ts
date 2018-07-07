declare interface RootFile {
    cf: string; // (c)reep (f)older
    rf: string; // (r)oom (f)older
}

const GameReaderFolderName = 'GameData';
const GameReaderFolderPath = `${SEG_Temp_Drive}${C_SEPERATOR}${GameReaderFolderName}`;
const CREEP_FOLDER = 'creeps';
const ROOM_FOLDER = 'rooms';

export class GameReader {
    static get FolderPath() { return GameReaderFolderPath; }
    private static rootFolder: IFolder;
    private static masterFile: RootFile;
    private static folders: IDictionary<string, IFolder>;
    static ReadGameState() {
        MasterFS.EnsurePath(GameReaderFolderPath);
        this.rootFolder = MasterFS.GetFolder(GameReaderFolderPath)!;
        if (!this.rootFolder.GetFile('GR.Dat')) {
            this.rootFolder.SaveFile('GR.Dat', {});
        }
        this.masterFile = this.rootFolder.GetFile<RootFile>('GR.Dat')!.contents;
        if (!this.masterFile.cf) {
            this.masterFile.cf = CREEP_FOLDER;
        }
        this.LoadFolder(this.masterFile.cf, CREEP_FOLDER);

        if (!this.masterFile.rf) {
            this.masterFile.rf = ROOM_FOLDER;
        }
        this.LoadFolder(this.masterFile.rf, ROOM_FOLDER);
    }

    private static LoadFolder(folder: string, index: string) {
        this.folders[index] = MasterFS.GetFolder(`${GameReaderFolderPath}${C_SEPERATOR}${folder}`)!;
    }

    private static CreateCreepDataFiles() {
        let curFiles = this.folders[CREEP_FOLDER].GetFileNames();
        let keys = Object.keys(curFiles);
        for (let i = 0; i < keys.length; i++) {
            if (!Game.creeps[keys[i]]) {
                // Creep has disappeared.
                this.folders[CREEP_FOLDER].DeleteFile(keys[i]);
            }
        }

        let creepNames = Object.keys(Game.creeps);
        for (let i = 0; i < creepNames.length; i++) {
            let creepName = creepNames[i];
            if (!this.folders[CREEP_FOLDER].GetFile(creepName)) {
                this.folders[CREEP_FOLDER].SaveFile(creepName, {});
            }
            this.UpdateCreepFile(this.folders[CREEP_FOLDER].GetFile(creepName)!, Game.creeps[creepName]);
        }
    }

    private static UpdateCreepFile(file: IFile<any>, creep: Creep) {

    }
}