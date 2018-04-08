import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { SwarmCreator } from "SwarmTypes/SwarmCreator";

export class SwarmQueen {
    static PrepTheSwarm() {
        DoTheSwarm((obj: AIObject): void => {
            obj.PrepObject();
        });
    }
    static ActivateTheSwarm() {
        DoTheSwarm((obj: AIObject): void => {
            obj.Activate();
        });
    }
}

const DoTheSwarm = function (swarmAction: (obj: AIObject) => void) {
    for (let i = 0; i < SwarmLoader.MasterMemoryIds.length; i++) {
        DoPartOfTheSwarm(swarmAction, SwarmLoader.MasterMemoryIds[i]);
    }
}

const DoPartOfTheSwarm = function (swarmAction: (obj: AIObject) => void, dataType: string) {
    let ids = Object.keys(SwarmLoader.GetTypeIDs(dataType));
    for (let i = 0; i < ids.length; i++) {
        swarmAction(SwarmLoader.GetObject(ids[i], dataType));
    }
}