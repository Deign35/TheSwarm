import { profile } from "Tools/Profiler";
import { Stopwatch } from "./Stopwatch";

@profile
export class GlobalTools {
    static CopyObject<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }
}

global['CopyObject'] = GlobalTools.CopyObject;
global['Stopwatch'] = Stopwatch;