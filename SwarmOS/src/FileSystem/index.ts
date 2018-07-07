declare var Memory: {
    FileSystem: IDictionary<string, IDictionary<string, MemBase>>;
}

import { FileSystem } from "./FileSystem";

export { FileSystem } from "./FileSystem";
export { Folder } from "./Folder";
export { File } from "./File"

export function InitializeFileSystem() {
    global['RAM'] = new FileSystem(SEG_RAM_Drive, {}); // Only ever initialized once.
    RAM.EnsurePath(SEG_RAM_Drive);
    RAM.GetFolder(SEG_RAM_Drive)!.CreateFile('dat', {
        tick: Game.time,
        counter: 0
    })

    RefreshFileSystem();
}

export function RefreshFileSystem() {
    if (!Memory.FileSystem) {
        Memory.FileSystem = {};
    }
    global['MasterFS'] = new FileSystem(SEG_Master_Drive, Memory.FileSystem); // Backed by Memory
    global['TCache'] = new FileSystem(SEG_Temp_Drive, {});
    TCache.EnsurePath(SEG_Temp_Drive);
    TCache.GetFolder(SEG_Temp_Drive)!.CreateFile('dat', {
        tick: Game.time,
    })
}

export function RecordStats() {
    TCache.RecordStats();
    if (Game.time % 11 == 0) {
        RAM.RecordStats();
    }
    if (Game.time % 29 == 0) {
        MasterFS.RecordStats();
    }
}