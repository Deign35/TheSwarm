require('globalConstants');
import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";
import "SwarmMemory/Swarmlord";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { SwarmObject, ObjectBase } from "SwarmTypes/SwarmTypes";
import { SwarmQueen } from "SwarmBehaviour/SwarmQueen";

export const loop = function () {
    debugger;
    Swarmlord.ValidateMemory();
    SwarmLoader.LoadTheSwarm();

    SwarmQueen.ActivateTheSwarm();
    SwarmLoader.SaveTheSwarm();
}

const DoTheSwarm = function (swarmAction: (obj: TSwarmObject, controllerType: SwarmControllerDataTypes) => void) {
    let typeKeys = Object.keys(TheSwarm);
    for (let i = 0; i < typeKeys.length; i++) {
        let ids = Object.keys(TheSwarm[typeKeys[i]]);
        for (let j = 0; j < ids.length; j++) {
            swarmAction(TheSwarm[typeKeys[i]][ids[j]], typeKeys[i] as SwarmControllerDataTypes);
        }
    }
}