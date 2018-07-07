declare var Memory: {
    FileSystem: IDictionary<string, IDictionary<string, MemBase>>;
}

import { FileSystem } from "./FileSystem";
import { Folder } from "./Folder";

export { Folder } from "./Folder";
export { File } from "./File"

export function InitializeFileSystem() {
    global['GCache'] = new Folder(SEG_Cache_Drive, {}); // Only ever initialized once.
    RefreshFileSystem();
}

export function RefreshFileSystem() {
    if (!Memory.FileSystem) {
        Memory.FileSystem = {};
    }
    global['MasterFS'] = new FileSystem(SEG_Master_Drive, Memory.FileSystem); // Backed by Memory
    global['TCache'] = new Folder(SEG_Temp_Drive, {});
}