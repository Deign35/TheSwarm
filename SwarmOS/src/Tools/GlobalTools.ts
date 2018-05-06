//import { MemoryBase } from "SwarmMemory/SwarmMemory";
import { Stopwatch } from "./Stopwatch";
//import { SwarmCreator } from "SwarmTypes/SwarmCreator";
import { SwarmLogger } from "Tools/SwarmLogger";

global['Stopwatch'] = Stopwatch;
//global['SwarmCreator'] = SwarmCreator;
global['SwarmLogger'] = SwarmLogger;
global['Logger'] = new SwarmLogger('Global');

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
    /*static DoTest(testID: string,
        memObject: MemoryBase,
        testFunction: () => void,
        workingVersion?: (exc: Error) => void) {
        try {
            testFunction();
            if (!memObject.HasData(testID)) {
                Logger.info('Test[' + testID + ']: Success');
                memObject.SetData(testID, true, false);
            }
        } catch (exc) {
            Logger.error('SwarmRoom_Base [' + testID + '] failed [' + JSON.stringify(exc) + ']');
            memObject.DeleteData(testID);
            if (workingVersion) {
                workingVersion(exc);
            }
        }
    }*/
    static GetSUID() {
        if (Memory.counterIDs.length > 0) {
            return Memory.counterIDs.shift()!;
        }
        return Memory.counter++;
    }
    static RecycleSUID(suid: string) {
        Memory.counterIDs.push(suid);
    }
}
global['CopyObject'] = GlobalTools.CopyObject;
global['GetSpawnCost'] = GlobalTools.GetSpawnCost;
global['ConstructBodyArray'] = GlobalTools.ConstructBodyArray;
//global['DoTest'] = GlobalTools.DoTest;
global['GetSUID'] = GlobalTools.GetSUID;
global['RecycleSUID'] = GlobalTools.RecycleSUID;

declare var Memory: {
    counter: number
    counterIDs: string[]
}