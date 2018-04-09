import { Stopwatch } from "./Stopwatch";
import { SwarmLogger } from "Tools/SwarmLogger";
import { SwarmCreator } from "SwarmTypes/SwarmCreator";
import { MemoryObject } from "SwarmMemory/SwarmMemory";

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
    static ConstructBodyArray(bodyPartsList: [BodyPartConstant, number][]): BodyPartConstant[] {
        let body: BodyPartConstant[] = [];
        for (let i = 0; i < bodyPartsList.length; i++) {
            for (let j = 0; j < bodyPartsList[i][1]; j++) {
                body.push(bodyPartsList[i][0]);
            }
        }

        return body;
    }

    // (TODO): Create a tools consul that manages memory for things, maybe only use flash memory!
    static DoTest(testID: string, memObject: MemoryObject, testFunction: () => void, workingVersion: (exc: Error) => void) {
        try {
            testFunction();
            if (!memObject.HasData(testID)) {
                SwarmLogger.Log('Test[' + testID + ']: Success');
                memObject.SetData(testID, true, false);
            }
        } catch (exc) {
            SwarmLogger.Log('SwarmRoom_Base [' + testID + '] failed [' + JSON.stringify(exc) + ']');
            memObject.DeleteData(testID);
            workingVersion(exc);
        }
    }
    static GetSUID() {
        return Memory.counter++;
    }
}
global['CopyObject'] = GlobalTools.CopyObject;
global['GetSpawnCost'] = GlobalTools.GetSpawnCost;
global['ConstructBodyArray'] = GlobalTools.ConstructBodyArray;
global['DoTest'] = GlobalTools.DoTest;
global['GetSUID'] = GlobalTools.GetSUID;

declare var Memory: {
    counter: number
}