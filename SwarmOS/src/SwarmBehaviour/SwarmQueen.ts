import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { ObjectBase } from "SwarmTypes/SwarmTypes";
import { SwarmMemoryTypes } from "SwarmTypes/SwarmCreator";

export class SwarmQueen {
    static PrepTheSwarm() {
        DoTheSwarm((obj, controllerType) => {
            obj.PrepObject();
        });
    }
    static ActivateTheSwarm() {
        DoTheSwarm((obj, controllerType) => {
            let swarmType = obj.GetSwarmType();
            if (swarmType == SwarmType.Any) {
                return;
            }
            obj.Activate();
        });
    }
}

const DoTheSwarm = function (swarmAction: (obj: ObjectBase<SwarmMemoryTypes, any>, controllerType: SwarmControllerDataTypes) => void) {
    let typeKeys = Object.keys(SwarmLoader.TheSwarm);
    for (let i = 0; i < typeKeys.length; i++) {
        let ids = Object.keys(SwarmLoader.TheSwarm[typeKeys[i]]);
        for (let j = 0; j < ids.length; j++) {
            swarmAction(SwarmLoader.TheSwarm[typeKeys[i]][ids[j]], typeKeys[i] as SwarmControllerDataTypes);
        }
    }
}