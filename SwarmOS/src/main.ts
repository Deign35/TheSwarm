require('globalConstants');
import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";
import "Memory/Swarmlord";
import { SwarmQueen } from "Queens/SwarmQueen";
import { SwarmManager } from "CreepManagers/SwarmManager";

export const loop = function () {
    debugger;
    Swarmlord.ValidateMemory();
    SwarmQueen.PrepareTheQueen();
    SwarmManager.PrepareTheSwarm();
    SwarmQueen.ActivateSwarm();
    SwarmManager.ActivateSwarm();
    SwarmQueen.FinalizeSwarmActivity();
    SwarmManager.FinalizeSwarmActivity();
}