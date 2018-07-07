declare interface RootFile {
    cf: string; // (c)reep (f)older
    rf: string; // (r)oom (f)older
}

const GameReaderFileLocation = `S:\\GameData`;
const CREEP_FOLDER = 'creeps';
const ROOM_FOLDER = 'rooms';

class GameReader {
    private static rootFolder: IFolder;
    private static masterFile: RootFile;
    private static folders: IDictionary<string, IFolder>;
    static ReadGameState() {
        MasterFS.EnsurePath(GameReaderFileLocation);
        this.rootFolder = MasterFS.GetFolder(GameReaderFileLocation)!;
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
        this.folders[index] = MasterFS.GetFolder(`${GameReaderFileLocation}${C_SEPERATOR}${folder}`)!;
    }

    private static CreateCreepDataFile() {
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
            let file = this.folders[CREEP_FOLDER].GetFile(creepNames[i]);
            if (!file) {
                this.folders[CREEP_FOLDER].SaveFile(creepNames[i], {});
            }
        }
    }
}