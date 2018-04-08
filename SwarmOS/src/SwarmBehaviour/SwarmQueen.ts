import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { ObjectBase } from "SwarmTypes/SwarmTypes";

/*const PREP_ORDER = [ // Cause by some objects gathering their information prior, such as available spawns
    SwarmControllerDataTypes.Rooms,
    SwarmControllerDataTypes.RoomObjects,
    SwarmControllerDataTypes.Flags,
    SwarmControllerDataTypes.Structures,
]*/
export class SwarmQueen {
    static PrepTheSwarm() {

        DoTheSwarm((obj) => {
            obj.PrepObject(false);
        });
    }
    static ActivateTheSwarm() {
        DoTheSwarm((obj) => {
            let swarmType = obj.GetSwarmType();
            if (swarmType == SwarmType.Any) {
                return;
            }
            obj.Activate();
        });
    }
}

const DoTheSwarm = function (swarmAction: (obj: ObjectBase<TBasicSwarmData, any>) => void) {
    let typeKeys = Object.keys(SwarmLoader.TheSwarm) as AIObject[];
    for (let i = 0; i < typeKeys.length; i++) {
        /*let ids = Object.keys(SwarmLoader.TheSwarm[typeKeys[i]]);
        for (let j = 0; j < ids.length; j++) {
            swarmAction(SwarmLoader.TheSwarm[typeKeys[i]][ids[j]]);
        }*/
        DoPartOfTheSwarm(swarmAction, typeKeys[i]);
    }
}

const DoPartOfTheSwarm = function (swarmAction: (obj: ObjectBase<AllMemoryTypes, any>) => void, controllerType: SwarmControllerDataTypes) {
    let ids = Object.keys(SwarmLoader.TheSwarm[controllerType]);
    for (let i = 0; i < ids.length; i++) {
        swarmAction(SwarmLoader.TheSwarm[controllerType][ids[i]]);
    }
}