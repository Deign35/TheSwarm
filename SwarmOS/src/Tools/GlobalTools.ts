import { Stopwatch } from "./Stopwatch";
import { SwarmLogger } from "Tools/SwarmLogger";
import { SwarmCreator } from "SwarmTypes/SwarmCreator";

global['Stopwatch'] = Stopwatch;
global['SwarmLogger'] = SwarmLogger;
global['SwarmCreator'] = SwarmCreator;

export class GlobalTools {
    static CopyObject<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }
    static GetSpawnCost(body: BodyPartConstant[]) {
        let bodyCost = 0;
        for (let i = 0; i < body.length; i++) {
            bodyCost += BODYPART_COST[body[i]]
        }

        return bodyCost;
    }
}
global['CopyObject'] = GlobalTools.CopyObject;
global['GetSpawnCost'] = GlobalTools.GetSpawnCost;