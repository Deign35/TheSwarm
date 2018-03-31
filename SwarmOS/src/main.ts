require('globalConstants');
import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";
import "SwarmMemory/Swarmlord"; // Remove this from global
import { SwarmLoader } from "SwarmTypes/SwarmLoader";

export const loop = function () {
    //debugger;
    Swarmlord.ValidateMemory();
    SwarmLoader.LoadTheSwarm();
    SwarmLoader.SaveTheSwarm();
}