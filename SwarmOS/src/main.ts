require('globalConstants');
import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";
import "Memory/Swarmlord";

export const loop = function () {
    Swarmlord.ValidateMemory();
}

const initSwarm = function () {
}