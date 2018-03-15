require('globalConstants');
import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";
import "Memory/Swarmlord";
import { SwarmQueen } from "SwarmManagers/SwarmQueen";
import { SwarmCreepController } from "SwarmManagers/SwarmCreepManager"

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