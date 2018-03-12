require('globalConstants');
import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";
import "Memory/Swarmlord";
import { SwarmQueen } from "Queens/SwarmQueen";

export const loop = function () {
    debugger;
    Swarmlord.ValidateMemory();

    SwarmQueen.PrepareTheSwarm();
    SwarmManager.PrepareTheSwarm();

    SwarmQueen.ActivateSwarm();
    SwarmManager.ActivateSwarm();

    SwarmQueen.FinalizeSwarmActivity();
    SwarmManager.FinalizeSwarmActivity();
}