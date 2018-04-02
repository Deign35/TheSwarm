require('globalConstants');
import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";
import "SwarmMemory/Swarmlord";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { SwarmObject, ObjectBase } from "SwarmTypes/SwarmTypes";

export const loop = function () {
    debugger;
    Swarmlord.ValidateMemory();
    SwarmLoader.LoadTheSwarm();

    /*DoTheSwarm((obj) => {
        let swarmType = obj.GetSwarmType();
        if (swarmType == SwarmType.Any) {
            return;
        }
        /*if (swarmType != SwarmType.SwarmRoom) {
            let roomName = (obj as SwarmObject<SwarmMemoryTypes, RoomObject>).room.name;
            TheSwarm.rooms[roomName].
        }
    })*/
    console.log(JSON.stringify(SwarmRoomIDs));
    let activatedObjects: { [id: string]: boolean } = {};
    let unactivatedObjects = GatherUnactivatedObjects(activatedObjects);
    do {
        let nextObjData = unactivatedObjects.shift()!;
        let nextObj = TheSwarm[nextObjData[1]][nextObjData[0]] as ObjectBase<SwarmMemoryTypes, any>
        nextObj.Activate();
        activatedObjects[nextObjData[0]] = true;
        if (unactivatedObjects.length == 0) {
            unactivatedObjects = GatherUnactivatedObjects(activatedObjects);
            
        }
    } while (unactivatedObjects.length > 0)

    SwarmLoader.SaveTheSwarm();
}

const DoTheSwarm = function (swarmAction: (obj: TSwarmObject) => void) {
    let typeKeys = Object.keys(TheSwarm);
    for (let i = 0; i < typeKeys.length; i++) {
        let ids = Object.keys(TheSwarm[typeKeys[i]]);
        for (let j = 0; j < ids.length; j++) {
            swarmAction(TheSwarm[typeKeys[i]][ids[j]]);
        }
    }
}
const GatherUnactivatedObjects = function (activatedIDs: { [id: string]: boolean }): [string, SwarmControllerDataTypes][] {
    let unactivatedObjects: [string, SwarmControllerDataTypes][] = [];
    let typeKeys = Object.keys(TheSwarm);
    for (let i = 0; i < typeKeys.length; i++) {
        let controllerType = typeKeys[i];
        let ids = Object.keys(TheSwarm[controllerType]);
        for (let j = 0; j < ids.length; j++) {
            if (!activatedIDs[ids[j]]) {
                unactivatedObjects.push([ids[j], controllerType as SwarmControllerDataTypes]);
            }
        }
    }

    return unactivatedObjects;
}