import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { ObjBase } from "SwarmTypes/SwarmTypes";

export class SwarmQueen {
    static PrepTheSwarm() {
        DoTheSwarm((obj: ObjBase): void => {
            obj.PrepObject();
        });
    }
    static ActivateTheSwarm() {
        DoTheSwarm((obj: ObjBase): void => {
            obj.Activate();
        });
    }
    static SaveTheSwarm() {
        DoTheSwarm((obj: ObjBase): void => {
            if (obj.memory.IsCheckedOut) {
                SwarmLoader.SaveObject(obj);
            }
        })
    }
}

const DoTheSwarm = function (swarmAction: (obj: ObjBase) => void) {
    for (let i = 0; i < SwarmLoader.MasterMemoryIds.length; i++) {
        DoPartOfTheSwarm(swarmAction, SwarmLoader.MasterMemoryIds[i]);
    }
}

const DoPartOfTheSwarm = function (swarmAction: (obj: ObjBase) => void, dataType: string) {
    let ids = SwarmLoader.GetTypeIDs(dataType);
    for (let i = 0; i < ids.length; i++) {
        swarmAction(SwarmLoader.GetObject(ids[i], dataType));
    }
}