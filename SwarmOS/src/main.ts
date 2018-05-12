declare var Memory: {
    VERSION: string,
    counter: number,
    testAlgorithms: Dictionary
}
let startLoad = Game.cpu.getUsed(); // Will not use any prototype defined version of getUsed
// Ensure all constants are initialized
require('globalConstants');

// Init the main logger
import { SwarmLogger } from "Tools/SwarmLogger";
global['Logger'] = new SwarmLogger();

// Ensure prototypes are loaded

import * as Profiler from "Tools/Profiler";
global.Profiler = Profiler.init();

import "Tools/GlobalTools";
import "Tools_Prototypes";

// Update the OS as needed
const RESET_IN_SIM_ON_UPDATE = false;
if (!Memory.VERSION || Memory.VERSION != SWARM_VERSION_DATE) {
    Logger.alert(`OS Version updated`);
    if (RESET_IN_SIM_ON_UPDATE && !!Game.rooms.sim) {
        Logger.fatal('SIM UPDATE RESET ENACTED');
        for (let id in Memory) {
            Memory[id] = undefined;
        }
        Logger.error(`SIM UPDATE RESET - Memory Cleaned`);
    }

    // Save the current memory to (segmented) Memory in case of a need to rollback.

    Logger.warn(`Updating OS to ${SWARM_VERSION_DATE}`);
    Memory.counter = Memory.counter || 1;
    Memory.testAlgorithms = Memory.testAlgorithms || {};
    Memory.VERSION = SWARM_VERSION_DATE;
    Logger.info(`Updating OS complete`)
}

import { kernel } from "Core/index";
import { bundle as SwarmManager } from "SwarmManagers/index";
import { creepBundle } from "Creeps/index";
import { roomBundle } from "Rooms/index";
import { flagBundle } from "Flags/index";

kernel.installBundles([SwarmManager, creepBundle, roomBundle, flagBundle]);

export function loop() {
    try {
        kernel.loop();
    } finally {
        Logger.DumpLogToConsole();
    }
};

let endLoad = Game.cpu.getUsed();
Logger.info(() => `SwarmOS reloaded - ${endLoad - startLoad}cpu`)