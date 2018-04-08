require('globalConstants');
import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";
import "SwarmMemory/Swarmlord";
import { SwarmLoader } from "SwarmTypes/SwarmLoader";
import { SwarmQueen } from "SwarmBehaviour/SwarmQueen";

export const loop = function () {
    //debugger;
    Swarmlord.ValidateMemory();
    SwarmLoader.LoadTheSwarm();

    SwarmQueen.PrepTheSwarm();
    SwarmQueen.ActivateTheSwarm();
    SwarmLoader.SaveTheSwarm();
}