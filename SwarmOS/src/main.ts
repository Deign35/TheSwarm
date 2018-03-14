require('globalConstants');
import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";
import "Memory/Swarmlord";
import { SwarmQueen } from "Queens/SwarmQueen";
import { SwarmCreepController } from "CreepManagers/SwarmCreepManager"

export const loop = function () {
    debugger;
    Swarmlord.ValidateMemory();

    SwarmQueen.PrepareTheSwarm();
    SwarmCreepController.PrepareTheSwarm();

    SwarmQueen.ActivateSwarm();
    SwarmCreepController.ActivateSwarm();

    SwarmQueen.FinalizeSwarmActivity();
    SwarmCreepController.FinalizeSwarmActivity();
}