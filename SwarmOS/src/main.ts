require('globalConstants');
import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";
import "SwarmMemory/Swarmlord";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";

export const loop = function () {
    //debugger;
    Swarmlord.ValidateMemory();
    let theSwarm = new SwarmLoader();

    theSwarm.SaveTheSwarm();
}