import { SwarmLoader } from "SwarmTypes/SwarmLoader";

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
    let ids = SwarmLoader.GetTypeIDs(dataType);
    for (let i = 0; i < ids.length; i++) {
        swarmAction(SwarmLoader.GetObject(ids[i], dataType));
    }
}