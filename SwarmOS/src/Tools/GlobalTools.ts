declare var Memory: {
    counter: number,
    counterIDs: string[],
    testAlgorithms: { [id: string]: number }
}

if (!Memory.counter) {
    Memory.counter = 1;
}

if (!Memory.counterIDs) {
    Memory.counterIDs = [];
}

if (!Memory.testAlgorithms) {
    Memory.testAlgorithms = {};
}
import { Stopwatch } from "./Stopwatch";
import { SwarmLogger } from "Tools/SwarmLogger";

global['Stopwatch'] = Stopwatch;
global['Logger'] = new SwarmLogger();

const NUM_ALLOWED_FAILURES = 10;
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
    static TestNewAlgorithm(testID: string,
        testFunction: () => void,
        workingVersion: () => void) {
        let wasSuccessful = false;
        if (!Memory.testAlgorithms[testID]) {
            Memory.testAlgorithms[testID] = 1;
        }

        try {
            if (Memory.testAlgorithms[testID] <= NUM_ALLOWED_FAILURES) {
                testFunction();
                wasSuccessful = true;
            } else {
                Logger.warn(`Test[${testID}] has failed ${NUM_ALLOWED_FAILURES} times.  Test skipped`);
            }
        } catch (exc) {
            Memory.testAlgorithms[testID] += 1;
            wasSuccessful = false;
            Logger.error(`Algorithm test [${testID}] failed: [${JSON.stringify(exc)}]`);
        }

        if (!wasSuccessful) {
            workingVersion();
        }
    }
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
global['TestNewAlgorithm'] = GlobalTools.TestNewAlgorithm;
global['GetSUID'] = GlobalTools.GetSUID;
global['RecycleSUID'] = GlobalTools.RecycleSUID;