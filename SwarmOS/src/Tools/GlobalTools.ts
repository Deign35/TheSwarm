import { Stopwatch } from "./Stopwatch";

global['Stopwatch'] = Stopwatch;

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
        return Memory.counter++;
    }

    static GetRandomIndex(list: any[]): number {
        if (!list || list.length == 0) {
            return 0;
        }

        return list[Math.floor(Math.random() * list.length)];
    }

    static GetRandomID<T>(dictionaryObject: IDictionary<T>): T | undefined {
        let index = this.GetRandomIndex(Object.keys(dictionaryObject));
        return (dictionaryObject && dictionaryObject[index]) || undefined;
    }

    static ForEach<T>(collection: IDictionary<T>, action: (val: T, index: number) => void): void {
        let ids = Object.keys(collection);
        for (let i = 0, length = ids.length; i < length; i++) {
            if (!collection[ids[i]]) {
                throw new Error(`Collection modified while executing ForEach`);
            }
            action(collection[ids[i]], i);
        }
    }
}
global['CopyObject'] = GlobalTools.CopyObject;
global['GetSpawnCost'] = GlobalTools.GetSpawnCost;
global['ConstructBodyArray'] = GlobalTools.ConstructBodyArray;
global['TestNewAlgorithm'] = GlobalTools.TestNewAlgorithm;
global['GetSUID'] = GlobalTools.GetSUID;
global['GetRandomIndex'] = GlobalTools.GetRandomIndex;
global['GetRandomID'] = GlobalTools.GetRandomID;
global['ForEach'] = GlobalTools.ForEach;