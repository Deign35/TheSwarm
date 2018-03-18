import { Stopwatch } from "./Stopwatch";
import { SwarmLogger } from "Tools/SwarmLogger";
export class GlobalTools {
    static CopyObject<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }
}

global['CopyObject'] = GlobalTools.CopyObject;
global['Stopwatch'] = Stopwatch;
global['SwarmLogger'] = SwarmLogger;
import "SwarmObjects/SwarmCreator"