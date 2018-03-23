require('globalConstants');
import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";
import "SwarmMemory/Swarmlord";
import { SwarmRoomController } from "SwarmControllers/SwarmRoomController";
import { SwarmCreepController } from "SwarmControllers/SwarmCreepController"
import { SwarmFlagController } from "SwarmControllers/SwarmFlagController"
import { SwarmStructureController } from "SwarmControllers/SwarmStructureController"

export const loop = function () {
    //debugger;
    Swarmlord.ValidateMemory();

    SwarmRoomController.PrepareTheSwarm();
    SwarmCreepController.PrepareTheSwarm();
    SwarmFlagController.PrepareTheSwarm();
    SwarmStructureController.PrepareTheSwarm();

    SwarmRoomController.ActivateSwarm();
    SwarmCreepController.ActivateSwarm();
    SwarmFlagController.ActivateSwarm();
    SwarmStructureController.ActivateSwarm();

    SwarmRoomController.FinalizeSwarmActivity();
    SwarmCreepController.FinalizeSwarmActivity();
    SwarmFlagController.FinalizeSwarmActivity();
    SwarmStructureController.FinalizeSwarmActivity();
}