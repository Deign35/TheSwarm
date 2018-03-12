import { Stopwatch } from "./Stopwatch";

export class GlobalTools {
    static CopyObject<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }
}

global['CopyObject'] = GlobalTools.CopyObject;
global['Stopwatch'] = Stopwatch;